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
      if (open) {
        const first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });
  }

  document.querySelectorAll(".filters").forEach((bar) => {
    const buttons = [...bar.querySelectorAll("button")];
    const items = [...document.querySelectorAll("[data-zone]")];
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const zone = button.dataset.filter;
        buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        items.forEach((item) => {
          item.hidden = zone !== "all" && item.dataset.zone !== zone;
        });
      });
    });
  });

  const form = document.querySelector("#ride-form");
  if (!form) return;

  document.documentElement.classList.add("js");

  const panels = [...form.querySelectorAll(".step-panel")];
  const stepper = [...document.querySelectorAll(".stepper li")];
  const backButton = document.querySelector("#back");
  const nextButton = document.querySelector("#next");
  const submitButton = document.querySelector("#submit");
  const confirmation = document.querySelector("#confirmation");
  let step = 0;

  const params = new URLSearchParams(window.location.search);
  const mobility = params.get("mobility");
  const who = params.get("who");
  if (mobility && form.elements.mobility) {
    const match = [...form.elements.mobility].find((input) => input.value === mobility);
    if (match) match.checked = true;
  }
  if (who && [...form.elements.bookerRole.options].some((option) => option.value === who)) {
    form.elements.bookerRole.value = who;
  }

  const facilityField = document.querySelector("#facility-field");
  const stairsNote = document.querySelector("#stairs-note");
  const stretcherNote = document.querySelector("#stretcher-note");
  const dateInput = form.elements.rideDate;

  if (dateInput) {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    dateInput.min = local.toISOString().slice(0, 10);
  }

  function selectedRadio(name) {
    const chosen = [...form.elements[name]].find((input) => input.checked);
    return chosen ? chosen.value : "";
  }

  function syncConditional() {
    const role = form.elements.bookerRole.value;
    if (facilityField) facilityField.hidden = role !== "facility";
    if (stairsNote) stairsNote.hidden = form.elements.stairs.value !== "flight";
    if (stretcherNote) stretcherNote.hidden = selectedRadio("mobility") !== "stretcher";
  }

  form.addEventListener("change", syncConditional);

  function setError(id, message) {
    const field = document.getElementById(id);
    const error = document.getElementById(id + "-error");
    if (!field || !error) return;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) field.setAttribute("aria-describedby", error.id);
    else field.removeAttribute("aria-describedby");
    error.hidden = !message;
    error.textContent = message || "";
  }

  function clearErrors(panel) {
    panel.querySelectorAll("[aria-invalid]").forEach((field) => field.setAttribute("aria-invalid", "false"));
    panel.querySelectorAll(".field-error").forEach((error) => {
      error.hidden = true;
      error.textContent = "";
    });
    const summary = panel.querySelector(".error-summary");
    if (summary) summary.hidden = true;
  }

  function digits(value) {
    const only = value.replace(/\D/g, "");
    return only.length === 11 && only.startsWith("1") ? only.slice(1) : only;
  }

  function validate(index) {
    const panel = panels[index];
    clearErrors(panel);
    const problems = [];

    const requireText = (id, label) => {
      const field = document.getElementById(id);
      if (!field || field.closest("[hidden]")) return;
      if (!field.value.trim()) {
        problems.push({ id, message: label + " is required." });
      }
    };

    if (index === 0) {
      requireText("riderName", "Rider name");
      requireText("phone", "A callback number");
      requireText("bookerRole", "Who is booking");
      if (form.elements.bookerRole.value === "facility") requireText("facilityName", "Facility or unit");
      const phone = digits(form.elements.phone.value);
      if (form.elements.phone.value.trim() && phone.length !== 10) {
        problems.push({ id: "phone", message: "Use a 10-digit phone number." });
      }
      const email = form.elements.email.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        problems.push({ id: "email", message: "That email does not look complete." });
      }
    }

    if (index === 1) {
      if (!selectedRadio("mobility")) problems.push({ id: "mobility-manual", message: "Choose the rider's mobility." });
      requireText("stairs", "Stairs at pickup");
    }

    if (index === 2) {
      requireText("pickup", "Pickup");
      requireText("pickupCity", "Pickup city");
      requireText("destination", "Destination");
      requireText("destinationCity", "Destination city");
      requireText("rideDate", "Date");
      requireText("rideTime", "Time");
      requireText("returnRide", "Whether a return is needed");
      if (dateInput && dateInput.value && dateInput.min && dateInput.value < dateInput.min) {
        problems.push({ id: "rideDate", message: "Choose today or a later date." });
      }
      if (form.elements.pickupCity.value === "Other" && form.elements.pickup.value.trim().length < 8) {
        problems.push({ id: "pickup", message: "Add the city to the pickup line." });
      }
      if (form.elements.destinationCity.value === "Other" && form.elements.destination.value.trim().length < 8) {
        problems.push({ id: "destination", message: "Add the city to the destination line." });
      }
    }

    if (index === 3 && !form.elements.consent.checked) {
      problems.push({ id: "consent", message: "Confirm you understand this practice site does not dispatch a ride." });
    }

    problems.forEach((problem) => setError(problem.id, problem.message));
    const summary = panel.querySelector(".error-summary");
    if (problems.length && summary) {
      summary.hidden = false;
      const list = summary.querySelector("ul");
      list.replaceChildren();
      problems.forEach((problem) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#" + problem.id;
        link.textContent = problem.message;
        item.append(link);
        list.append(item);
      });
      summary.focus();
    }
    return problems.length === 0;
  }

  function labelFor(name, value) {
    const field = form.elements[name];
    if (!field) return value || "—";
    if (field.tagName === "SELECT") {
      const option = [...field.options].find((item) => item.value === value);
      return option ? option.textContent.trim() : (value || "—");
    }
    const list = typeof field.length === "number" ? [...field] : [field];
    const match = list.find((input) => input.value === value);
    if (!match) return value || "—";
    const strong = match.closest("label") && match.closest("label").querySelector("strong");
    return strong ? strong.textContent.trim() : (value || "—");
  }

  function addReviewRow(label, value) {
    const row = document.createElement("p");
    const name = document.createElement("span");
    name.textContent = label;
    row.append(name, document.createTextNode(value || "—"));
    return row;
  }

  function renderReview() {
    const review = document.querySelector("#review");
    const role = form.elements.bookerRole.value;
    const rows = [
      ["Rider", form.elements.riderName.value.trim()],
      ["Booking", labelFor("bookerRole", role)],
      ["Callback", form.elements.phone.value.trim()],
      ["Email", form.elements.email.value.trim() || "None"],
      ["Mobility", labelFor("mobility", selectedRadio("mobility"))],
      ["Stairs", labelFor("stairs", form.elements.stairs.value)],
      ["Pickup", form.elements.pickup.value.trim() + ", " + form.elements.pickupCity.value],
      ["Destination", form.elements.destination.value.trim() + ", " + form.elements.destinationCity.value],
      ["When", form.elements.rideDate.value + " at " + form.elements.rideTime.value],
      ["Return", labelFor("returnRide", form.elements.returnRide.value)],
      ["Notes", form.elements.notes.value.trim() || "None"]
    ];
    if (role === "facility") rows.splice(2, 0, ["Facility", form.elements.facilityName.value.trim()]);
    review.replaceChildren(...rows.map(([label, value]) => addReviewRow(label, value)));
  }

  function showStep(next, moveFocus) {
    step = next;
    panels.forEach((panel, index) => panel.classList.toggle("is-current", index === step));
    stepper.forEach((item, index) => {
      item.classList.toggle("is-current", index === step);
      item.classList.toggle("is-done", index < step);
    });
    backButton.hidden = step === 0;
    nextButton.hidden = step === panels.length - 1;
    submitButton.hidden = step !== panels.length - 1;
    if (step === panels.length - 1) renderReview();
    if (moveFocus) {
      const heading = panels[step].querySelector("h2");
      if (heading) heading.focus();
    }
  }

  backButton.addEventListener("click", () => showStep(Math.max(0, step - 1), true));
  nextButton.addEventListener("click", () => {
    if (validate(step)) showStep(Math.min(panels.length - 1, step + 1), true);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (step < panels.length - 1) {
      if (validate(step)) showStep(step + 1, true);
      return;
    }
    if (!validate(step)) return;

    const reference = "EBM-" + form.elements.rideDate.value.replaceAll("-", "").slice(2) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const record = {
      reference,
      rider: form.elements.riderName.value.trim(),
      when: form.elements.rideDate.value + " " + form.elements.rideTime.value,
      pickup: form.elements.pickupCity.value,
      destination: form.elements.destinationCity.value,
      savedAt: new Date().toISOString()
    };

    try {
      const prior = JSON.parse(localStorage.getItem("ebm-practice-requests") || "[]");
      prior.unshift(record);
      localStorage.setItem("ebm-practice-requests", JSON.stringify(prior.slice(0, 8)));
    } catch (error) {
      /* Private mode can block storage. The confirmation still stands. */
    }

    form.hidden = true;
    document.querySelector(".stepper").hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector(".ref").textContent = reference;
    confirmation.querySelector("#confirm-copy").textContent =
      record.rider + " · " + record.when + " · " + record.pickup + " to " + record.destination + ". Saved in this browser only.";
    confirmation.querySelector("h2").focus();
  });

  document.querySelector("#another").addEventListener("click", () => {
    form.reset();
    syncConditional();
    confirmation.hidden = true;
    form.hidden = false;
    document.querySelector(".stepper").hidden = false;
    showStep(0, true);
  });

  syncConditional();
  showStep(0, false);
})();
