(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    const closeNav = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
      document.body.classList.remove("nav-lock");
    };
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
      document.body.classList.toggle("nav-lock", open);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  }

  const form = document.querySelector("#inquiry");
  if (!form) return;

  const summary = document.querySelector("#inquiry-errors");
  const done = document.querySelector("#inquiry-done");
  const copy = document.querySelector("#inquiry-copy");

  function setError(id, message) {
    const field = document.getElementById(id);
    const error = document.getElementById(id + "-error");
    if (!field || !error) return;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    error.hidden = !message;
    error.textContent = message || "";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ["name", "agency", "email", "need", "message"].forEach((id) => setError(id, ""));
    const problems = [];
    const requireText = (id, label) => {
      if (!form.elements[id].value.trim()) problems.push({ id, message: label + " is required." });
    };
    requireText("name", "Name");
    requireText("agency", "Agency");
    requireText("email", "Email");
    requireText("need", "The kind of work");
    requireText("message", "What the agency needs decided");
    const email = form.elements.email.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      problems.push({ id: "email", message: "That email does not look complete." });
    }
    problems.forEach((problem) => setError(problem.id, problem.message));
    if (problems.length) {
      summary.hidden = false;
      const list = summary.querySelector("ul");
      list.replaceChildren();
      problems.forEach((problem) => {
        const item = document.createElement("li");
        item.textContent = problem.message;
        list.append(item);
      });
      summary.focus();
      return;
    }
    summary.hidden = true;
    const need = form.elements.need.options[form.elements.need.selectedIndex].textContent;
    const text = [
      "East Bay Mobility — draft inquiry",
      "Name: " + form.elements.name.value.trim(),
      "Agency: " + form.elements.agency.value.trim(),
      "Email: " + email,
      "Work: " + need,
      "Location: " + (form.elements.location.value.trim() || "Not given"),
      "",
      form.elements.message.value.trim()
    ].join("\n");
    copy.value = text;
    form.hidden = true;
    done.hidden = false;
    done.querySelector("h2").focus();
  });

  document.querySelector("#copy-inquiry").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copy.value);
      document.querySelector("#copy-inquiry").textContent = "Copied";
    } catch (error) {
      copy.focus();
      copy.select();
    }
  });

  document.querySelector("#another-inquiry").addEventListener("click", () => {
    form.reset();
    done.hidden = true;
    form.hidden = false;
    document.querySelector("#copy-inquiry").textContent = "Copy inquiry";
  });
})();
