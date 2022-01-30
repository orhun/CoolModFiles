import {GITHUB_TOKEN} from '$lib/variables'

export default async function fetchReadme() {
    const reponse = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      query: `{
      repository(owner: "orhun", name: "CoolModFiles") {
        content: object(expression: "master:HELP.md") {
          ... on Blob {
            text
          }
        }
      }
    }`,
    }),
  });

  return (await reponse.json()).data.repository.content.text;

}