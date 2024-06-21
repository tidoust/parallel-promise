import webref from '../../w3c/webref/ed/index.json' with { type: 'json' };
import reffy from 'reffy';

const specsThatUseInParallelWithoutLink = [
  'encrypted-media',
  'webcodecs',
  'webrtc'
];

async function analyze(spec) {
  // Things worth analyzing:
  // - Absence of any explicit algorithm when IDL is present, looking for `class="algorithm"`.
  // - Presence of implicit algorithms that could be explicitly flagged, looking for lists that look like steps.
  // - Use of "in parallel" in an algorithm without linking back to HTML
  // - Use of a "queue a task" variant without linking back to HTML
  // - Use of "enqueue the following steps" without linking back to HTML
  // - Algorithm that is called from within "in parallel" steps of another algorithm and does not start with an "Assert" clause
  // - Use of "in parallel" followed by "resolve/reject" without any "queue a task", see cases below
  // - Use of "in parallel" followed by "fire an event" without any "queue a task", see cases below

  // Case: "Assert: these steps are running in parallel."
  // https://fedidcg.github.io/FedCM/#attempt-to-disconnect

  // Case: "Run these steps in parallel" with nesting
  // https://privacycg.github.io/requestStorageAccessFor/#dom-document-requeststorageaccessfor
  // https://w3c.github.io/webdriver-bidi/#commands-sessionend

  // Case: "run the remaining steps in parallel" without nesting
  // https://fullscreen.spec.whatwg.org/#dom-element-requestfullscreen

  // Case: inline "in parallel"
  // https://w3c.github.io/webcodecs/#dom-imagedecoder-istypesupported

  // Note: "Queue a task" may be used with nesting:
  // https://webassembly.github.io/content-security-policy/js-api/#asynchronously-compile-a-webassembly-module
  // https://privacycg.github.io/storage-access/#dom-document-requeststorageaccess

  // Note: "Queue a task" may also be used inline:
  // https://wicg.github.io/WebApiDevice/device_attributes/#dom-navigatormanageddata-getannotatedassetids
  // https://w3c.github.io/deviceorientation/#dom-deviceorientationevent-requestpermission
  // https://webmachinelearning.github.io/webnn/#dom-ml-createcontext

  // Note: No easy way to detect that an algorithm is called "in parallel"
  // unless it starts with an "Assert" clause

  // Note: It's going to be hard to process specs that define their own queue
  // and "queue a task" mechanism
  // https://wicg.github.io/background-fetch/#queue-a-bgfetch-task
}

async function main() {
  const crawl = await reffy.expandCrawlResult(webref, '../../w3c/webref/ed') ;

  // Retrieve information about the "in parallel" definition from the HTML spec
  const html = crawl.results.find(spec => spec.shortname === 'html');
  const dfn = html.dfns.find(dfn => dfn.linkingText[0] === 'in parallel');
  const [multipageUrl, fragment] = dfn.href.split('#');
  const singlepageUrl = multipageUrl.replace(/\/multipage\/[^#]+#/, '\/#');

  // Extract all specs that link to the definition
  const specs = crawl.results.filter(spec =>
    specsThatUseInParallelWithoutLink.includes(spec.shortname) ||
    Object.keys(spec.links?.rawlinks ?? {})
      .concat(Object.keys(spec.links?.autolinks ?? {}))
      .find(link =>
        (link === multipageUrl || link === singlepageUrl) &&
        (spec.links?.rawlinks?.[link] ?? spec.links?.autolinks?.[link]).anchors?.find(anchor => anchor === fragment)
      )
  );

  console.log(specs
    .map(spec => `- [ ] [${spec.title}](${spec.nightly?.url ?? spec.url})`)
    .join('\n'));
}

main().then(_ => console.log('A vous les studios, à vous Cognacq-Jay.'));