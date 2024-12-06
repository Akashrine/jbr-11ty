function showTooltip(tooltipContainer) {
  const tooltip = tooltipContainer.querySelector("[role='tooltip']");
  if (tooltip) {
      tooltip.classList.remove("hidden");
  }
}

function hideTooltip(tooltipContainer) {
  const tooltip = tooltipContainer.querySelector("[role='tooltip']");
  if (tooltip) {
      tooltip.classList.add("hidden");
  }
}

function setupTooltips() {
  const abbrs = Array.from(document.querySelectorAll("abbr[data-tooltip]"));

  abbrs.forEach((abbr, index) => {
      // Create a container for the tooltip
      const tooltipContainer = document.createElement("span");
      tooltipContainer.setAttribute("data-tooltip", "");
      tooltipContainer.innerHTML = `
          <a href="#tt-${index}" aria-describedby="tt-${index}">
              <abbr>${abbr.innerHTML}</abbr>
          </a>
          <span role="tooltip" id="tt-${index}" class="hidden">${abbr.getAttribute("title")}</span>
      `;

      // Replace the original abbr with the tooltip container
      abbr.parentElement.replaceChild(tooltipContainer, abbr);

      // Add event listeners for showing and hiding the tooltip
      tooltipContainer.addEventListener("mouseenter", () => showTooltip(tooltipContainer));
      tooltipContainer.addEventListener("mouseleave", () => hideTooltip(tooltipContainer));
  });
}

// Initialize tooltips on DOMContentLoaded
document.addEventListener("DOMContentLoaded", setupTooltips);

export { showTooltip, hideTooltip, setupTooltips };
