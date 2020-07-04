function showTooltip(tooltipContainer) { 
    tooltipContainer.querySelector("[role='tooltip']").classList.remove("hidden"); 
  }
  
  function hideTooltip(tooltipContainer) { 
    tooltipContainer.querySelector("[role='tooltip']").classList.add("hidden"); 
  }
  
  const abbrs = Array.from(document.querySelectorAll("abbr[data-tooltip]"));
  
  abbrs.forEach((abbr, index) => {
    
    // Change abbr element to a link and span
    const tooltipContainer = document.createElement("span");
    tooltipContainer.setAttribute("data-tooltip", "");
    tooltipContainer.innerHTML = `
      <a href="#tt-${index}" aria-describedby="tt-${index}">
        <abbr>${abbr.innerHTML}</abbr>
      </a>
      <span role="tooltip" id="tt-${index}" class="hidden">${abbr.getAttribute("title")}</span>
    `;
  
    abbr.parentElement.replaceChild(tooltipContainer, abbr);
    
    tooltipContainer.addEventListener("mouseenter", (e) => showTooltip(tooltipContainer));
    tooltipContainer.addEventListener("mouseleave", (e) => hideTooltip(tooltipContainer));
  });
  