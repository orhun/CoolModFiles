import Root from '__GENERATED__/root.svelte';
import { fallback, routes } from '__GENERATED__/manifest.js';
import { onMount, tick } from 'svelte';
import { g as get_base_uri } from '../chunks/utils.js';
import { writable } from 'svelte/store';
import { init } from './singletons.js';
import { set_paths } from '../paths.js';

function scroll_state() {
	return {
		x: pageXOffset,
		y: pageYOffset
	};
}

/**
 * @param {Event} event
 * @returns {HTMLAnchorElement | SVGAElement | undefined}
 */
function find_anchor(event) {
	const node = event
		.composedPath()
		.find((e) => e instanceof Node && e.nodeName.toUpperCase() === 'A'); // SVG <a> elements have a lowercase name
	return /** @type {HTMLAnchorElement | SVGAElement | undefined} */ (node);
}

/**
 * @param {HTMLAnchorElement | SVGAElement} node
 * @returns {URL}
 */
function get_href(node) {
	return node instanceof SVGAElement
		? new URL(node.href.baseVal, document.baseURI)
		: new URL(node.href);
}

class Router {
	/**
	 * @param {{
	 *    base: string;
	 *    routes: import('types/internal').CSRRoute[];
	 *    trailing_slash: import('types/internal').TrailingSlash;
	 *    renderer: import('./renderer').Renderer
	 * }} opts
	 */
	constructor({ base, routes, trailing_slash, renderer }) {
		this.base = base;
		this.routes = routes;
		this.trailing_slash = trailing_slash;
		/** Keeps tracks of multiple navigations caused by redirects during rendering */
		this.navigating = 0;

		/** @type {import('./renderer').Renderer} */
		this.renderer = renderer;
		renderer.router = this;

		this.enabled = true;

		// make it possible to reset focus
		document.body.setAttribute('tabindex', '-1');

		// keeping track of the history index in order to prevent popstate navigation events if needed
		this.current_history_index = history.state?.['sveltekit:index'] ?? 0;

		if (this.current_history_index === 0) {
			// create initial history entry, so we can return here
			history.replaceState({ ...history.state, 'sveltekit:index': 0 }, '', location.href);
		}

		this.callbacks = {
			/** @type {Array<({ from, to, cancel }: { from: URL, to: URL | null, cancel: () => void }) => void>} */
			before_navigate: [],

			/** @type {Array<({ from, to }: { from: URL | null, to: URL }) => void>} */
			after_navigate: []
		};
	}

	init_listeners() {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}

		// Adopted from Nuxt.js
		// Reset scrollRestoration to auto when leaving page, allowing page reload
		// and back-navigation from other pages to use the browser to restore the
		// scrolling position.
		addEventListener('beforeunload', (e) => {
			let should_block = false;

			const intent = {
				from: this.renderer.current.url,
				to: null,
				cancel: () => (should_block = true)
			};

			this.callbacks.before_navigate.forEach((fn) => fn(intent));

			if (should_block) {
				e.preventDefault();
				e.returnValue = '';
			} else {
				history.scrollRestoration = 'auto';
			}
		});

		// Setting scrollRestoration to manual again when returning to this page.
		addEventListener('load', () => {
			history.scrollRestoration = 'manual';
		});

		// There's no API to capture the scroll location right before the user
		// hits the back/forward button, so we listen for scroll events

		/** @type {NodeJS.Timeout} */
		let scroll_timer;
		addEventListener('scroll', () => {
			clearTimeout(scroll_timer);
			scroll_timer = setTimeout(() => {
				// Store the scroll location in the history
				// This will persist even if we navigate away from the site and come back
				const new_state = {
					...(history.state || {}),
					'sveltekit:scroll': scroll_state()
				};
				history.replaceState(new_state, document.title, window.location.href);
				// iOS scroll event intervals happen between 30-150ms, sometimes around 200ms
			}, 200);
		});

		/** @param {Event} event */
		const trigger_prefetch = (event) => {
			const a = find_anchor(event);
			if (a && a.href && a.hasAttribute('sveltekit:prefetch')) {
				this.prefetch(get_href(a));
			}
		};

		/** @type {NodeJS.Timeout} */
		let mousemove_timeout;

		/** @param {MouseEvent|TouchEvent} event */
		const handle_mousemove = (event) => {
			clearTimeout(mousemove_timeout);
			mousemove_timeout = setTimeout(() => {
				// event.composedPath(), which is used in find_anchor, will be empty if the event is read in a timeout
				// add a layer of indirection to address that
				event.target?.dispatchEvent(
					new CustomEvent('sveltekit:trigger_prefetch', { bubbles: true })
				);
			}, 20);
		};

		addEventListener('touchstart', trigger_prefetch);
		addEventListener('mousemove', handle_mousemove);
		addEventListener('sveltekit:trigger_prefetch', trigger_prefetch);

		/** @param {MouseEvent} event */
		addEventListener('click', (event) => {
			if (!this.enabled) return;

			// Adapted from https://github.com/visionmedia/page.js
			// MIT license https://github.com/visionmedia/page.js#license
			if (event.button || event.which !== 1) return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			if (event.defaultPrevented) return;

			const a = find_anchor(event);
			if (!a) return;

			if (!a.href) return;

			const url = get_href(a);
			const url_string = url.toString();
			if (url_string === location.href) {
				if (!location.hash) event.preventDefault();
				return;
			}

			// Ignore if tag has
			// 1. 'download' attribute
			// 2. 'rel' attribute includes external
			const rel = (a.getAttribute('rel') || '').split(/\s+/);

			if (a.hasAttribute('download') || (rel && rel.includes('external'))) {
				return;
			}

			// Ignore if <a> has a target
			if (a instanceof SVGAElement ? a.target.baseVal : a.target) return;

			// Check if new url only differs by hash
			if (url.href.split('#')[0] === location.href.split('#')[0]) {
				// Call `pushState` to add url to history so going back works.
				// Also make a delay, otherwise the browser default behaviour would not kick in
				setTimeout(() => history.pushState({}, '', url.href));
				const info = this.parse(url);
				if (info) {
					return this.renderer.update(info, [], false);
				}
				return;
			}

			this._navigate({
				url,
				scroll: a.hasAttribute('sveltekit:noscroll') ? scroll_state() : null,
				keepfocus: false,
				chain: [],
				details: {
					state: {},
					replaceState: false
				},
				accepted: () => event.preventDefault(),
				blocked: () => event.preventDefault()
			});
		});

		addEventListener('popstate', (event) => {
			if (event.state && this.enabled) {
				// if a popstate-driven navigation is cancelled, we need to counteract it
				// with history.go, which means we end up back here, hence this check
				if (event.state['sveltekit:index'] === this.current_history_index) return;

				this._navigate({
					url: new URL(location.href),
					scroll: event.state['sveltekit:scroll'],
					keepfocus: false,
					chain: [],
					details: null,
					accepted: () => {
						this.current_history_index = event.state['sveltekit:index'];
					},
					blocked: () => {
						const delta = this.current_history_index - event.state['sveltekit:index'];
						history.go(delta);
					}
				});
			}
		});
	}

	/**
	 * Returns true if `url` has the same origin and basepath as the app
	 * @param {URL} url
	 */
	owns(url) {
		return url.origin === location.origin && url.pathname.startsWith(this.base);
	}

	/**
	 * @param {URL} url
	 * @returns {import('./types').NavigationInfo | undefined}
	 */
	parse(url) {
		if (this.owns(url)) {
			const path = decodeURI(url.pathname.slice(this.base.length) || '/');

			return {
				id: url.pathname + url.search,
				routes: this.routes.filter(([pattern]) => pattern.test(path)),
				url,
				path
			};
		}
	}

	/**
	 * @typedef {Parameters<typeof import('$app/navigation').goto>} GotoParams
	 *
	 * @param {GotoParams[0]} href
	 * @param {GotoParams[1]} opts
	 * @param {string[]} chain
	 */
	async goto(
		href,
		{ noscroll = false, replaceState = false, keepfocus = false, state = {} } = {},
		chain
	) {
		const url = new URL(href, get_base_uri(document));

		if (this.enabled) {
			return this._navigate({
				url,
				scroll: noscroll ? scroll_state() : null,
				keepfocus,
				chain,
				details: {
					state,
					replaceState
				},
				accepted: () => {},
				blocked: () => {}
			});
		}

		location.href = url.href;
		return new Promise(() => {
			/* never resolves */
		});
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	/**
	 * @param {URL} url
	 * @returns {Promise<import('./types').NavigationResult>}
	 */
	async prefetch(url) {
		const info = this.parse(url);

		if (!info) {
			throw new Error('Attempted to prefetch a URL that does not belong to this app');
		}

		return this.renderer.load(info);
	}

	/** @param {({ from, to }: { from: URL | null, to: URL }) => void} fn */
	after_navigate(fn) {
		onMount(() => {
			this.callbacks.after_navigate.push(fn);

			return () => {
				const i = this.callbacks.after_navigate.indexOf(fn);
				this.callbacks.after_navigate.splice(i, 1);
			};
		});
	}

	/**
	 * @param {({ from, to, cancel }: { from: URL, to: URL | null, cancel: () => void }) => void} fn
	 */
	before_navigate(fn) {
		onMount(() => {
			this.callbacks.before_navigate.push(fn);

			return () => {
				const i = this.callbacks.before_navigate.indexOf(fn);
				this.callbacks.before_navigate.splice(i, 1);
			};
		});
	}

	/**
	 * @param {{
	 *   url: URL;
	 *   scroll: { x: number, y: number } | null;
	 *   keepfocus: boolean;
	 *   chain: string[];
	 *   details: {
	 *     replaceState: boolean;
	 *     state: any;
	 *   } | null;
	 *   accepted: () => void;
	 *   blocked: () => void;
	 * }} opts
	 */
	async _navigate({ url, scroll, keepfocus, chain, details, accepted, blocked }) {
		const from = this.renderer.current.url;
		let should_block = false;

		const intent = {
			from,
			to: url,
			cancel: () => (should_block = true)
		};

		this.callbacks.before_navigate.forEach((fn) => fn(intent));

		if (should_block) {
			blocked();
			return;
		}

		const info = this.parse(url);
		if (!info) {
			location.href = url.href;
			return new Promise(() => {
				// never resolves
			});
		}

		accepted();

		if (!this.navigating) {
			dispatchEvent(new CustomEvent('sveltekit:navigation-start'));
		}
		this.navigating++;

		let { pathname } = url;

		if (this.trailing_slash === 'never') {
			if (pathname !== '/' && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
		} else if (this.trailing_slash === 'always') {
			const is_file = /** @type {string} */ (url.pathname.split('/').pop()).includes('.');
			if (!is_file && !pathname.endsWith('/')) pathname += '/';
		}

		info.url = new URL(url.origin + pathname + url.search + url.hash);

		if (details) {
			const change = details.replaceState ? 0 : 1;
			details.state['sveltekit:index'] = this.current_history_index += change;
			history[details.replaceState ? 'replaceState' : 'pushState'](details.state, '', info.url);
		}

		await this.renderer.handle_navigation(info, chain, false, {
			scroll,
			keepfocus
		});

		this.navigating--;
		if (!this.navigating) {
			dispatchEvent(new CustomEvent('sveltekit:navigation-end'));

			const navigation = { from, to: url };
			this.callbacks.after_navigate.forEach((fn) => fn(navigation));
		}
	}
}

/**
 * @param {unknown} err
 * @return {Error}
 */
function coalesce_to_error(err) {
	return err instanceof Error ||
		(err && /** @type {any} */ (err).name && /** @type {any} */ (err).message)
		? /** @type {Error} */ (err)
		: new Error(JSON.stringify(err));
}

/**
 * Hash using djb2
 * @param {import('types/hooks').StrictBody} value
 */
function hash(value) {
	let hash = 5381;
	let i = value.length;

	if (typeof value === 'string') {
		while (i) hash = (hash * 33) ^ value.charCodeAt(--i);
	} else {
		while (i) hash = (hash * 33) ^ value[--i];
	}

	return (hash >>> 0).toString(36);
}

/**
 * @param {import('types/page').LoadOutput} loaded
 * @returns {import('types/internal').NormalizedLoadOutput}
 */
function normalize(loaded) {
	const has_error_status =
		loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
	if (loaded.error || has_error_status) {
		const status = loaded.status;

		if (!loaded.error && has_error_status) {
			return {
				status: status || 500,
				error: new Error()
			};
		}

		const error = typeof loaded.error === 'string' ? new Error(loaded.error) : loaded.error;

		if (!(error instanceof Error)) {
			return {
				status: 500,
				error: new Error(
					`"error" property returned from load() must be a string or instance of Error, received type "${typeof error}"`
				)
			};
		}

		if (!status || status < 400 || status > 599) {
			console.warn('"error" returned from load() without a valid status code — defaulting to 500');
			return { status: 500, error };
		}

		return { status, error };
	}

	if (loaded.redirect) {
		if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
			return {
				status: 500,
				error: new Error(
					'"redirect" property returned from load() must be accompanied by a 3xx status code'
				)
			};
		}

		if (typeof loaded.redirect !== 'string') {
			return {
				status: 500,
				error: new Error('"redirect" property returned from load() must be a string')
			};
		}
	}

	// TODO remove before 1.0
	if (/** @type {any} */ (loaded).context) {
		throw new Error(
			'You are returning "context" from a load function. ' +
				'"context" was renamed to "stuff", please adjust your code accordingly.'
		);
	}

	return /** @type {import('types/internal').NormalizedLoadOutput} */ (loaded);
}

/**
 * @typedef {import('types/internal').CSRComponent} CSRComponent
 * @typedef {{ from: URL; to: URL }} Navigating
 */

/** @param {any} value */
function notifiable_store(value) {
	const store = writable(value);
	let ready = true;

	function notify() {
		ready = true;
		store.update((val) => val);
	}

	/** @param {any} new_value */
	function set(new_value) {
		ready = false;
		store.set(new_value);
	}

	/** @param {(value: any) => void} run */
	function subscribe(run) {
		/** @type {any} */
		let old_value;
		return store.subscribe((new_value) => {
			if (old_value === undefined || (ready && new_value !== old_value)) {
				run((old_value = new_value));
			}
		});
	}

	return { notify, set, subscribe };
}

/**
 * @param {RequestInfo} resource
 * @param {RequestInit} [opts]
 */
function initial_fetch(resource, opts) {
	const url = typeof resource === 'string' ? resource : resource.url;

	let selector = `script[data-type="svelte-data"][data-url=${JSON.stringify(url)}]`;

	if (opts && typeof opts.body === 'string') {
		selector += `[data-body="${hash(opts.body)}"]`;
	}

	const script = document.querySelector(selector);
	if (script && script.textContent) {
		const { body, ...init } = JSON.parse(script.textContent);
		return Promise.resolve(new Response(body, init));
	}

	return fetch(resource, opts);
}

class Renderer {
	/**
	 * @param {{
	 *   Root: CSRComponent;
	 *   fallback: [CSRComponent, CSRComponent];
	 *   target: Node;
	 *   session: any;
	 * }} opts
	 */
	constructor({ Root, fallback, target, session }) {
		this.Root = Root;
		this.fallback = fallback;

		/** @type {import('./router').Router | undefined} */
		this.router;

		this.target = target;

		this.started = false;

		this.session_id = 1;
		this.invalid = new Set();
		this.invalidating = null;
		this.autoscroll = true;
		this.updating = false;

		/** @type {import('./types').NavigationState} */
		this.current = {
			// @ts-ignore - we need the initial value to be null
			url: null,
			session_id: 0,
			branch: []
		};

		/** @type {Map<string, import('./types').NavigationResult>} */
		this.cache = new Map();

		/** @type {{id: string | null, promise: Promise<import('./types').NavigationResult> | null}} */
		this.loading = {
			id: null,
			promise: null
		};

		this.stores = {
			url: notifiable_store({}),
			page: notifiable_store({}),
			navigating: writable(/** @type {Navigating | null} */ (null)),
			session: writable(session)
		};

		this.$session = null;

		this.root = null;

		let ready = false;
		this.stores.session.subscribe(async (value) => {
			this.$session = value;

			if (!ready || !this.router) return;
			this.session_id += 1;

			const info = this.router.parse(new URL(location.href));
			if (info) this.update(info, [], true);
		});
		ready = true;
	}

	disable_scroll_handling() {
		if (import.meta.env.DEV && this.started && !this.updating) {
			throw new Error('Can only disable scroll handling during navigation');
		}

		if (this.updating || !this.started) {
			this.autoscroll = false;
		}
	}

	/**
	 * @param {{
	 *   status: number;
	 *   error: Error;
	 *   nodes: Array<Promise<CSRComponent>>;
	 *   url: URL;
	 *   params: Record<string, string>;
	 * }} selected
	 */
	async start({ status, error, nodes, url, params }) {
		/** @type {Array<import('./types').BranchNode | undefined>} */
		const branch = [];

		/** @type {Record<string, any>} */
		let stuff = {};

		/** @type {import('./types').NavigationResult | undefined} */
		let result;

		let error_args;

		// url.hash is empty when coming from the server
		url.hash = window.location.hash;

		try {
			for (let i = 0; i < nodes.length; i += 1) {
				const is_leaf = i === nodes.length - 1;

				const node = await this._load_node({
					module: await nodes[i],
					url,
					params,
					stuff,
					status: is_leaf ? status : undefined,
					error: is_leaf ? error : undefined
				});

				branch.push(node);

				if (node && node.loaded) {
					if (node.loaded.error) {
						if (error) throw node.loaded.error;
						error_args = {
							status: node.loaded.status,
							error: node.loaded.error,
							url
						};
					} else if (node.loaded.stuff) {
						stuff = {
							...stuff,
							...node.loaded.stuff
						};
					}
				}
			}

			result = error_args
				? await this._load_error(error_args)
				: await this._get_navigation_result_from_branch({
						url,
						params,
						stuff,
						branch,
						status,
						error
				  });
		} catch (e) {
			if (error) throw e;

			result = await this._load_error({
				status: 500,
				error: coalesce_to_error(e),
				url
			});
		}

		if (result.redirect) {
			// this is a real edge case — `load` would need to return
			// a redirect but only in the browser
			location.href = new URL(result.redirect, location.href).href;
			return;
		}

		this._init(result);
	}

	/**
	 * @param {import('./types').NavigationInfo} info
	 * @param {string[]} chain
	 * @param {boolean} no_cache
	 * @param {{hash?: string, scroll: { x: number, y: number } | null, keepfocus: boolean}} [opts]
	 */
	async handle_navigation(info, chain, no_cache, opts) {
		if (this.started) {
			this.stores.navigating.set({
				from: this.current.url,
				to: info.url
			});
		}

		await this.update(info, chain, no_cache, opts);
	}

	/**
	 * @param {import('./types').NavigationInfo} info
	 * @param {string[]} chain
	 * @param {boolean} no_cache
	 * @param {{hash?: string, scroll: { x: number, y: number } | null, keepfocus: boolean}} [opts]
	 */
	async update(info, chain, no_cache, opts) {
		const token = (this.token = {});
		let navigation_result = await this._get_navigation_result(info, no_cache);

		// abort if user navigated during update
		if (token !== this.token) return;

		this.invalid.clear();

		if (navigation_result.redirect) {
			if (chain.length > 10 || chain.includes(info.url.pathname)) {
				navigation_result = await this._load_error({
					status: 500,
					error: new Error('Redirect loop'),
					url: info.url
				});
			} else {
				if (this.router) {
					this.router.goto(
						new URL(navigation_result.redirect, info.url).href,
						{ replaceState: true },
						[...chain, info.url.pathname]
					);
				} else {
					location.href = new URL(navigation_result.redirect, location.href).href;
				}

				return;
			}
		}

		this.updating = true;

		if (this.started) {
			this.current = navigation_result.state;

			this.root.$set(navigation_result.props);
			this.stores.navigating.set(null);
		} else {
			this._init(navigation_result);
		}

		// opts must be passed if we're navigating
		if (opts) {
			const { scroll, keepfocus } = opts;

			if (!keepfocus) {
				getSelection()?.removeAllRanges();
				document.body.focus();
			}

			// need to render the DOM before we can scroll to the rendered elements
			await tick();

			if (this.autoscroll) {
				const deep_linked = info.url.hash && document.getElementById(info.url.hash.slice(1));
				if (scroll) {
					scrollTo(scroll.x, scroll.y);
				} else if (deep_linked) {
					// Here we use `scrollIntoView` on the element instead of `scrollTo`
					// because it natively supports the `scroll-margin` and `scroll-behavior`
					// CSS properties.
					deep_linked.scrollIntoView();
				} else {
					scrollTo(0, 0);
				}
			}
		} else {
			// in this case we're simply invalidating
			await tick();
		}

		this.loading.promise = null;
		this.loading.id = null;
		this.autoscroll = true;
		this.updating = false;

		if (!this.router) return;

		const leaf_node = navigation_result.state.branch[navigation_result.state.branch.length - 1];
		if (leaf_node && leaf_node.module.router === false) {
			this.router.disable();
		} else {
			this.router.enable();
		}
	}

	/**
	 * @param {import('./types').NavigationInfo} info
	 * @returns {Promise<import('./types').NavigationResult>}
	 */
	load(info) {
		this.loading.promise = this._get_navigation_result(info, false);
		this.loading.id = info.id;

		return this.loading.promise;
	}

	/** @param {string} href */
	invalidate(href) {
		this.invalid.add(href);

		if (!this.invalidating) {
			this.invalidating = Promise.resolve().then(async () => {
				const info = this.router && this.router.parse(new URL(location.href));
				if (info) await this.update(info, [], true);

				this.invalidating = null;
			});
		}

		return this.invalidating;
	}

	/** @param {import('./types').NavigationResult} result */
	_init(result) {
		this.current = result.state;

		const style = document.querySelector('style[data-svelte]');
		if (style) style.remove();

		this.root = new this.Root({
			target: this.target,
			props: {
				stores: this.stores,
				...result.props
			},
			hydrate: true
		});

		this.started = true;

		if (this.router) {
			const navigation = { from: null, to: new URL(location.href) };
			this.router.callbacks.after_navigate.forEach((fn) => fn(navigation));
		}
	}

	/**
	 * @param {import('./types').NavigationInfo} info
	 * @param {boolean} no_cache
	 * @returns {Promise<import('./types').NavigationResult>}
	 */
	async _get_navigation_result(info, no_cache) {
		if (this.loading.id === info.id && this.loading.promise) {
			return this.loading.promise;
		}

		for (let i = 0; i < info.routes.length; i += 1) {
			const route = info.routes[i];

			// load code for subsequent routes immediately, if they are as
			// likely to match the current path/query as the current one
			let j = i + 1;
			while (j < info.routes.length) {
				const next = info.routes[j];
				if (next[0].toString() === route[0].toString()) {
					next[1].forEach((loader) => loader());
					j += 1;
				} else {
					break;
				}
			}

			const result = await this._load(
				{
					route,
					info
				},
				no_cache
			);
			if (result) return result;
		}

		return await this._load_error({
			status: 404,
			error: new Error(`Not found: ${info.url.pathname}`),
			url: info.url
		});
	}

	/**
	 *
	 * @param {{
	 *   url: URL;
	 *   params: Record<string, string>;
	 *   stuff: Record<string, any>;
	 *   branch: Array<import('./types').BranchNode | undefined>;
	 *   status: number;
	 *   error?: Error;
	 * }} opts
	 */
	async _get_navigation_result_from_branch({ url, params, stuff, branch, status, error }) {
		const filtered = /** @type {import('./types').BranchNode[] } */ (branch.filter(Boolean));
		const redirect = filtered.find((f) => f.loaded && f.loaded.redirect);

		/** @type {import('./types').NavigationResult} */
		const result = {
			redirect: redirect && redirect.loaded ? redirect.loaded.redirect : undefined,
			state: {
				url,
				params,
				branch,
				session_id: this.session_id
			},
			props: {
				components: filtered.map((node) => node.module.default)
			}
		};

		for (let i = 0; i < filtered.length; i += 1) {
			const loaded = filtered[i].loaded;
			result.props[`props_${i}`] = loaded ? await loaded.props : null;
		}

		if (!this.current.url || url.href !== this.current.url.href) {
			result.props.page = { url, params, status, error, stuff };

			// TODO remove this for 1.0
			/**
			 * @param {string} property
			 * @param {string} replacement
			 */
			const print_error = (property, replacement) => {
				Object.defineProperty(result.props.page, property, {
					get: () => {
						throw new Error(`$page.${property} has been replaced by $page.url.${replacement}`);
					}
				});
			};

			print_error('origin', 'origin');
			print_error('path', 'pathname');
			print_error('query', 'searchParams');
		}

		const leaf = filtered[filtered.length - 1];
		const maxage = leaf.loaded && leaf.loaded.maxage;

		if (maxage) {
			const key = url.pathname + url.search; // omit hash
			let ready = false;

			const clear = () => {
				if (this.cache.get(key) === result) {
					this.cache.delete(key);
				}

				unsubscribe();
				clearTimeout(timeout);
			};

			const timeout = setTimeout(clear, maxage * 1000);

			const unsubscribe = this.stores.session.subscribe(() => {
				if (ready) clear();
			});

			ready = true;

			this.cache.set(key, result);
		}

		return result;
	}

	/**
	 * @param {{
	 *   status?: number;
	 *   error?: Error;
	 *   module: CSRComponent;
	 *   url: URL;
	 *   params: Record<string, string>;
	 *   stuff: Record<string, any>;
	 * }} options
	 * @returns
	 */
	async _load_node({ status, error, module, url, params, stuff }) {
		/** @type {import('./types').BranchNode} */
		const node = {
			module,
			uses: {
				params: new Set(),
				url: false,
				session: false,
				stuff: false,
				dependencies: []
			},
			loaded: null,
			stuff
		};

		/** @type {Record<string, string>} */
		const uses_params = {};
		for (const key in params) {
			Object.defineProperty(uses_params, key, {
				get() {
					node.uses.params.add(key);
					return params[key];
				},
				enumerable: true
			});
		}

		const session = this.$session;

		if (module.load) {
			const { started } = this;

			/** @type {import('types/page').LoadInput | import('types/page').ErrorLoadInput} */
			const load_input = {
				params: uses_params,
				get url() {
					node.uses.url = true;
					return url;
				},
				get session() {
					node.uses.session = true;
					return session;
				},
				get stuff() {
					node.uses.stuff = true;
					return { ...stuff };
				},
				fetch(resource, info) {
					const requested = typeof resource === 'string' ? resource : resource.url;
					const { href } = new URL(requested, url);
					node.uses.dependencies.push(href);

					return started ? fetch(resource, info) : initial_fetch(resource, info);
				}
			};

			if (import.meta.env.DEV) {
				// TODO remove this for 1.0
				Object.defineProperty(load_input, 'page', {
					get: () => {
						throw new Error('`page` in `load` functions has been replaced by `url` and `params`');
					}
				});
			}

			if (error) {
				/** @type {import('types/page').ErrorLoadInput} */ (load_input).status = status;
				/** @type {import('types/page').ErrorLoadInput} */ (load_input).error = error;
			}

			const loaded = await module.load.call(null, load_input);

			if (!loaded) {
				throw new Error('load function must return a value');
			}

			node.loaded = normalize(loaded);
			if (node.loaded.stuff) node.stuff = node.loaded.stuff;
		}

		return node;
	}

	/**
	 * @param {import('./types').NavigationCandidate} selected
	 * @param {boolean} no_cache
	 * @returns {Promise<import('./types').NavigationResult | undefined>} undefined if fallthrough
	 */
	async _load({ route, info: { url, path } }, no_cache) {
		const key = url.pathname + url.search;

		if (!no_cache) {
			const cached = this.cache.get(key);
			if (cached) return cached;
		}

		const [pattern, a, b, get_params] = route;
		const params = get_params
			? // the pattern is for the route which we've already matched to this path
			  get_params(/** @type {RegExpExecArray}  */ (pattern.exec(path)))
			: {};

		const changed = this.current.url && {
			url: key !== this.current.url.pathname + this.current.url.search,
			params: Object.keys(params).filter((key) => this.current.params[key] !== params[key]),
			session: this.session_id !== this.current.session_id
		};

		/** @type {Array<import('./types').BranchNode | undefined>} */
		let branch = [];

		/** @type {Record<string, any>} */
		let stuff = {};
		let stuff_changed = false;

		/** @type {number | undefined} */
		let status = 200;

		/** @type {Error | undefined} */
		let error;

		// preload modules
		a.forEach((loader) => loader());

		load: for (let i = 0; i < a.length; i += 1) {
			/** @type {import('./types').BranchNode | undefined} */
			let node;

			try {
				if (!a[i]) continue;

				const module = await a[i]();
				const previous = this.current.branch[i];

				const changed_since_last_render =
					!previous ||
					module !== previous.module ||
					(changed.url && previous.uses.url) ||
					changed.params.some((param) => previous.uses.params.has(param)) ||
					(changed.session && previous.uses.session) ||
					previous.uses.dependencies.some((dep) => this.invalid.has(dep)) ||
					(stuff_changed && previous.uses.stuff);

				if (changed_since_last_render) {
					node = await this._load_node({
						module,
						url,
						params,
						stuff
					});

					if (node && node.loaded) {
						if (node.loaded.fallthrough) {
							return;
						}
						if (node.loaded.error) {
							status = node.loaded.status;
							error = node.loaded.error;
						}

						if (node.loaded.redirect) {
							return {
								redirect: node.loaded.redirect,
								props: {},
								state: this.current
							};
						}

						if (node.loaded.stuff) {
							stuff_changed = true;
						}
					}
				} else {
					node = previous;
				}
			} catch (e) {
				status = 500;
				error = coalesce_to_error(e);
			}

			if (error) {
				while (i--) {
					if (b[i]) {
						let error_loaded;

						/** @type {import('./types').BranchNode | undefined} */
						let node_loaded;
						let j = i;
						while (!(node_loaded = branch[j])) {
							j -= 1;
						}

						try {
							error_loaded = await this._load_node({
								status,
								error,
								module: await b[i](),
								url,
								params,
								stuff: node_loaded.stuff
							});

							if (error_loaded && error_loaded.loaded && error_loaded.loaded.error) {
								continue;
							}

							if (error_loaded && error_loaded.loaded && error_loaded.loaded.stuff) {
								stuff = {
									...stuff,
									...error_loaded.loaded.stuff
								};
							}

							branch = branch.slice(0, j + 1).concat(error_loaded);
							break load;
						} catch (e) {
							continue;
						}
					}
				}

				return await this._load_error({
					status,
					error,
					url
				});
			} else {
				if (node && node.loaded && node.loaded.stuff) {
					stuff = {
						...stuff,
						...node.loaded.stuff
					};
				}

				branch.push(node);
			}
		}

		return await this._get_navigation_result_from_branch({
			url,
			params,
			stuff,
			branch,
			status,
			error
		});
	}

	/**
	 * @param {{
	 *   status: number;
	 *   error: Error;
	 *   url: URL;
	 * }} opts
	 */
	async _load_error({ status, error, url }) {
		/** @type {Record<string, string>} */
		const params = {}; // error page does not have params

		const node = await this._load_node({
			module: await this.fallback[0],
			url,
			params,
			stuff: {}
		});
		const error_node = await this._load_node({
			status,
			error,
			module: await this.fallback[1],
			url,
			params,
			stuff: (node && node.loaded && node.loaded.stuff) || {}
		});

		const branch = [node, error_node];
		const stuff = { ...node?.loaded?.stuff, ...error_node?.loaded?.stuff };

		return await this._get_navigation_result_from_branch({
			url,
			params,
			stuff,
			branch,
			status,
			error
		});
	}
}

/**
 * @param {{
 *   paths: {
 *     assets: string;
 *     base: string;
 *   },
 *   target: Node;
 *   session: any;
 *   route: boolean;
 *   spa: boolean;
 *   trailing_slash: import('types/internal').TrailingSlash;
 *   hydrate: {
 *     status: number;
 *     error: Error;
 *     nodes: Array<Promise<import('types/internal').CSRComponent>>;
 *     url: URL;
 *     params: Record<string, string>;
 *   };
 * }} opts
 */
async function start({ paths, target, session, route, spa, trailing_slash, hydrate }) {
	if (import.meta.env.DEV && !target) {
		throw new Error('Missing target element. See https://kit.svelte.dev/docs#configuration-target');
	}

	const renderer = new Renderer({
		Root,
		fallback,
		target,
		session
	});

	const router = route
		? new Router({
				base: paths.base,
				routes,
				trailing_slash,
				renderer
		  })
		: null;

	init({ router, renderer });
	set_paths(paths);

	if (hydrate) await renderer.start(hydrate);
	if (router) {
		if (spa) router.goto(location.href, { replaceState: true }, []);
		router.init_listeners();
	}

	dispatchEvent(new CustomEvent('sveltekit:start'));
}

export { start };
