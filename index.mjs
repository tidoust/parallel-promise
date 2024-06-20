import webref from '../../w3c/webref/ed/index.json' with { type: 'json' };
import reffy from 'reffy';

async function main() {
  const crawl = await reffy.expandCrawlResult(webref, '../../w3c/webref/ed') ;

  // Retrieve information about the "in parallel" definition from the HTML spec
  const html = crawl.results.find(spec => spec.shortname === 'html');
  const dfn = html.dfns.find(dfn => dfn.linkingText[0] === 'in parallel');
  const [multipageUrl, fragment] = dfn.href.split('#');
  const singlepageUrl = multipageUrl.replace(/\/multipage\/[^#]+#/, '\/#');

  // Extract all specs that link to the definition
  const specsWithInParallel = crawl.results.filter(spec =>
    Object.keys(spec.links?.rawlinks ?? {})
      .concat(Object.keys(spec.links?.autolinks ?? {}))
      .find(link =>
        (link === multipageUrl || link === singlepageUrl) &&
        (spec.links?.rawlinks?.[link] ?? spec.links?.autolinks?.[link]).anchors?.find(anchor => anchor === fragment)
      )
  );
  console.log(specsWithInParallel
    .map(spec => `- [ ] [${spec.title}](${spec.nightly?.url ?? spec.url})`)
    .join('\n'));
}

main().then(_ => console.log('A vous les studios, à vous Cognacq-Jay.'));