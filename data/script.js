const specSelector = document.getElementById("spec");
const algos = document.getElementById("algos");

const { results } = await (await fetch("./index.json")).json();

specSelector.addEventListener("change", showSpec);

results.sort((a,b) => a.title.localeCompare(b.title)).forEach(s => {
  if (s.algorithms) {
    const opt = document.createElement("option");
    opt.value = s.algorithms;
    opt.textContent = s.title;
    specSelector.append(opt);
  }
});

function showAlgo(a, level = 0) {
  const ret = [];
  if (level === 0) {
    const heading = document.createElement("h2");
    if (a.name) {
      if (a.href) {
	const link = document.createElement("a");
	link.textContent = a.name;
	link.href = a.href;
	heading.append(link);
      } else {
	heading.textContent = a.name;
      }
    } else {
      heading.textContent = "(unnamed algorithm)";
    }
    ret.push(heading);
  }
  if (a.html) {
    const intro = document.createElement("div");
    intro.innerHTML = a.html;
    ret.push(intro);
  }
  if (!a.steps) return ret;
  const container = document.createElement(a.operation === "switch" ? "dl" : "ol");
  for (const step of a.steps) {
    if (step.case) {
      const dt = document.createElement("dt");
      dt.innerHTML = step.case;
      const dd = document.createElement("dd");
      dd.append(...showAlgo(step, level + 1));
      container.append(dt, dd);
    } else {
      const li = document.createElement("li");
      li.append(...showAlgo(step, level + 1));
      container.append(li);
    }
  }
  ret.push(container);
  const additional = a.additional ?? a.additionalAlgorithms;
  if (additional) {
    const div = document.createElement("div");
    div.className = "additional";
    div.append("Additional:", ...additional.map(aa => showAlgo(aa, level +1)).flat());
    ret.push(div);
  }
  if (a.ignored) {
    const div = document.createElement("div");
    div.className = "ignored";
    div.textContent = "Ignored: " + a.ignored;
    ret.push(div);
  }
  return ret;
}

async function showSpec(e) {
  const { algorithms } = await (await fetch(e.target.value)).json();
  algos.innerHTML = "";
  for (const a of algorithms) {
    const section = document.createElement("section");
    section.append(...showAlgo(a));
    algos.append(section);
  }
}
