// Groundbreakable — get-started.html Development Profile form
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://pgcospvlhorcvssafjoo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E8B6OF7rTmNhlEVvS36fiA_wewl5tER";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("intakeForm");
if (form) {
  const successEl = document.getElementById("intakeSuccess");
  const submitBtn = document.getElementById("intakeSubmit");
  const submitError = document.getElementById("intakeSubmitError");

  const clearErrors = () => {
    form.querySelectorAll(".intake__error.is-visible").forEach((el) => el.classList.remove("is-visible"));
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  };

  const showError = (name) => {
    const err = form.querySelector('.intake__error[data-error-for="' + name + '"]');
    if (err) err.classList.add("is-visible");
    const group = form.querySelector('[data-group="' + name + '"]') || form.querySelector('[name="' + name + '"]');
    if (group) group.classList.add("is-invalid");
  };

  const getChecked = (name) =>
    Array.from(form.querySelectorAll('input[name="' + name + '"]:checked')).map((el) => el.value);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    submitError.hidden = true;

    // Honeypot: bots tend to fill every field, real visitors never see this one.
    if (form.elements["companyWebsite"].value.trim() !== "") {
      return;
    }

    const developTypes = getChecked("developTypes");
    const currentMarkets = form.elements["currentMarkets"].value.trim();
    const openToNewMarkets = form.elements["openToNewMarkets"].checked;
    const areaAttractive = form.elements["areaAttractive"].value.trim();
    const siteCriteria = form.elements["siteCriteria"].value.trim();
    const uncoverPriorities = getChecked("uncoverPriorities");
    const fullName = form.elements["fullName"].value.trim();
    const companyName = form.elements["companyName"].value.trim();
    const email = form.elements["email"].value.trim();
    const phone = form.elements["phone"].value.trim();

    let firstInvalid = null;
    const flagInvalid = (name) => {
      showError(name);
      if (!firstInvalid) firstInvalid = name;
    };

    if (developTypes.length === 0) flagInvalid("developTypes");
    if (!currentMarkets && !openToNewMarkets) flagInvalid("currentMarkets");
    if (!areaAttractive) flagInvalid("areaAttractive");
    if (!siteCriteria) flagInvalid("siteCriteria");
    if (uncoverPriorities.length === 0) flagInvalid("uncoverPriorities");
    if (!fullName) flagInvalid("fullName");
    if (!companyName) flagInvalid("companyName");
    if (!email || !isValidEmail(email)) flagInvalid("email");

    if (firstInvalid) {
      const target =
        form.querySelector('[data-group="' + firstInvalid + '"]') ||
        form.querySelector('[name="' + firstInvalid + '"]');
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");

    const { error } = await supabase.from("development_profiles").insert({
      develop_types: developTypes,
      current_markets: currentMarkets || null,
      open_to_new_markets: openToNewMarkets,
      area_attractive: areaAttractive,
      site_criteria: siteCriteria,
      uncover_priorities: uncoverPriorities,
      full_name: fullName,
      company: companyName,
      work_email: email,
      phone: phone || null,
    });

    submitBtn.disabled = false;
    submitBtn.classList.remove("is-loading");

    if (error) {
      submitError.hidden = false;
      return;
    }

    form.hidden = true;
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
