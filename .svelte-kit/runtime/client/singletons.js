/**
 * The router is nullable, but not typed that way for ease-of-use
 * @type {import('./router').Router}
 */
let router;

/** @type {import('./renderer').Renderer} */
let renderer;

/**
 * @param {{
 *   router: import('./router').Router?;
 *   renderer: import('./renderer').Renderer;
 * }} opts
 */
function init(opts) {
	router = /** @type {import('../client/router').Router} */ (opts.router);
	renderer = opts.renderer;
}

export { init, renderer, router };
