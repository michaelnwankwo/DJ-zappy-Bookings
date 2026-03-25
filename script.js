/* ============================================
   DJ ZAPPY - SMART-BOOKING ENGINE 
   CORE OPERATING SYSTEM (V4.5 - BRANDED)
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
    // If the logo file is missing, hide the broken icon to keep the UI clean
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
      // UI Reset
      packageCards.forEach((c) => c.classList.remove("selected"));
      document
        .querySelectorAll(".select-btn, .select-btn-primary")
        .forEach((btn) => {
          btn.classList.remove("active");
        });

      // Activate Selection
      this.classList.add("selected");
      const innerBtn = this.querySelector("button");
      if (innerBtn) innerBtn.classList.add("active");

      // Set Price & Pulse Branding
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

    // Update Total Display with "Updating" Effect
    totalDisplay.classList.add("updating");
    totalDisplay.innerText = `$${total}`;

    setTimeout(() => {
      totalDisplay.classList.remove("updating");
    }, 300);
  }

  // --- 5. DATE PICKER ENHANCEMENT ---
  if (dateInput) {
    dateInput.addEventListener("click", function () {
      try {
        if (typeof this.showPicker === "function") {
          this.showPicker();
        }
      } catch (err) {
        this.focus();
      }
    });
  }

  // --- 6. SECURE BOOKING (EMAILJS + SMS ALERTS) ---
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
      submitBtn.innerText = "BOOKING...";
      submitBtn.style.opacity = "0.5";
      submitBtn.disabled = true;

      // DATA COLLECTOR: Summary of all choices
      const selectedAddons = [];
      checkboxes.forEach((check) => {
        if (check.checked) {
          const addonName = check
            .closest(".addon-item")
            .querySelector("span").innerText;
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
          document.querySelector(".package-card.selected .package-name")
            ?.innerText || "Custom",
        addons_list:
          selectedAddons.length > 0
            ? selectedAddons.join(", ")
            : "None Selected",
      };

      // !!! REPLACE WITH YOUR DASHBOARD IDs !!!
      const SERVICE_ID = "service_q6pj0t4";
      const TEMPLATE_ID = "template_xsag79r";

      emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams).then(
        () => {
          // SUCCESS: Trigger Success Overlay
          if (successOverlay) {
            successOverlay.classList.add("active");
          }

          // Reset UI State
          submitBtn.innerText = "BOOKING SECURED";
          submitBtn.style.opacity = "1";
          submitBtn.disabled = false;

          bookingForm.reset();
          currentBasePrice = 0;
          calculateTotal();

          // Cleanup selections
          packageCards.forEach((c) => c.classList.remove("selected"));
          checkboxes.forEach((c) => {
            const parent = c.closest(".addon-item");
            if (parent) parent.classList.remove("selected");
          });
        },
        (error) => {
          submitBtn.innerText = "SECURE BOOKING";
          submitBtn.style.opacity = "1";
          submitBtn.disabled = false;
          alert("Submission Failed. Check your EmailJS IDs.");
          console.error("EmailJS Error:", error);
        },
      );
    });
  }
});
