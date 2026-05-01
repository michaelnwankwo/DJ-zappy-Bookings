/* ============================================
   DJ ZAPPY - SMART-BOOKING ENGINE 
   CORE OPERATING SYSTEM (V5.0 - HYBRID ADAPTIVE)
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. ELEMENT SELECTORS ---
  const totalDisplay = document.getElementById("total-display");
  const bookingForm = document.getElementById("booking-form");
  const packageCards = document.querySelectorAll(".package-card");
  const checkboxes = document.querySelectorAll(
    '.addon-item input[type="checkbox"]',
  );
  const dateInput = document.querySelector('input[name="event_date"]');
  const successOverlay = document.getElementById("success-overlay");
  const mainLogo = document.querySelector(".main-logo");

  let currentBasePrice = 0;

  // --- 2. LOGIC: BRAND PULSE & FAILSAFE ---
  if (mainLogo) {
    mainLogo.onerror = () => (mainLogo.style.display = "none");
  }

  function triggerLogoPulse() {
    if (mainLogo) {
      mainLogo.style.transform = "scale(1.1)";
      mainLogo.style.filter = "drop-shadow(0 0 20px var(--cyber-cyan))";
      setTimeout(() => {
        mainLogo.style.transform = "scale(1)";
        mainLogo.style.filter = "drop-shadow(0 0 10px rgba(0, 232, 255, 0.4))";
      }, 300);
    }
  }

  // --- 3. PACKAGE SELECTION LOGIC ---
  packageCards.forEach((card) => {
    card.addEventListener("click", function () {
      packageCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");

      currentBasePrice = parseInt(this.getAttribute("data-price")) || 0;
      triggerLogoPulse();
      calculateTotal();
    });
  });

  // --- 4. ADD-ON & CALCULATION ENGINE ---
  checkboxes.forEach((check) => {
    check.addEventListener("change", function () {
      const parentLabel = this.closest(".addon-item");
      if (this.checked) {
        parentLabel.classList.add("selected");
        triggerLogoPulse();
      } else {
        parentLabel.classList.remove("selected");
      }
      calculateTotal();
    });
  });

  function calculateTotal() {
    let total = currentBasePrice;
    checkboxes.forEach((check) => {
      if (check.checked) {
        total += parseInt(check.getAttribute("data-price")) || 0;
      }
    });

    if (totalDisplay) {
      totalDisplay.classList.add("updating");
      totalDisplay.innerText = `$${total}`;
      setTimeout(() => totalDisplay.classList.remove("updating"), 300);
    }
  }

  // --- 5. HYBRID DATE PICKER (iOS PLACEHOLDER FIX) ---
  if (dateInput) {
    // Ensure it starts as text to show placeholder
    dateInput.type = "text";

    dateInput.addEventListener("focus", function () {
      this.type = "date";
      // Try to open native picker immediately
      if (typeof this.showPicker === "function") {
        try {
          this.showPicker();
        } catch (e) {
          console.log("Internal picker call failed, falling back to focus.");
        }
      }
    });

    dateInput.addEventListener("blur", function () {
      // If no date was selected, switch back to text to show placeholder
      if (!this.value) {
        this.type = "text";
      }
    });
  }

  // --- 6. SECURE BOOKING (EMAILJS) ---
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (currentBasePrice === 0) {
        alert(
          "Surgical Alert: Please select a base package to initialize the booking.",
        );
        return;
      }

      const submitBtn = document.querySelector(".book-now-btn");
      const originalText = submitBtn.innerText;

      submitBtn.innerText = "INITIALIZING...";
      submitBtn.style.opacity = "0.5";
      submitBtn.disabled = true;

      const selectedAddons = [];
      checkboxes.forEach((check) => {
        if (check.checked) {
          const addonName =
            check.closest(".addon-item").querySelector("span")?.innerText ||
            "Unknown Addon";
          selectedAddons.push(addonName);
        }
      });

      const templateParams = {
        client_name: document.querySelector('input[name="client_name"]').value,
        client_email: document.querySelector('input[name="client_email"]')
          .value,
        client_number: document.querySelector('input[name="client_number"]')
          .value,
        event_date: document.querySelector('input[name="event_date"]').value,
        total_price: totalDisplay.innerText,
        package_selected:
          document.querySelector(".package-card.selected h3")?.innerText ||
          "Custom",
        addons_list:
          selectedAddons.length > 0
            ? selectedAddons.join(", ")
            : "None Selected",
      };

      const SERVICE_ID = "service_q6pj0t4";
      const TEMPLATE_ID = "template_xsag79r";

      emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams).then(
        () => {
          if (successOverlay) successOverlay.classList.add("active");
          submitBtn.innerText = "BOOKING SECURED";
          submitBtn.style.opacity = "1";

          bookingForm.reset();
          if (dateInput) dateInput.type = "text"; // Reset date field state
          currentBasePrice = 0;
          calculateTotal();
          packageCards.forEach((c) => c.classList.remove("selected"));
          checkboxes.forEach((c) =>
            c.closest(".addon-item").classList.remove("selected"),
          );
        },
        (error) => {
          submitBtn.innerText = originalText;
          submitBtn.style.opacity = "1";
          submitBtn.disabled = false;
          alert("Submission Failed. Please try again.");
          console.error("EmailJS Error:", error);
        },
      );
    });
  }
});

function toggleSound() {
  const video = document.getElementById("heroVideo");
  const btn = document.getElementById("soundToggleBtn");

  if (video.muted) {
    video.muted = false;
    btn.innerHTML = "🔇 Mute Video";
  } else {
    video.muted = true;
    btn.innerHTML = "🔊 Unmute Video";
  }
}
