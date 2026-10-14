const buttons=[...document.querySelectorAll("[data-project-filter]")];
const cards=[...document.querySelectorAll(".astra-project[data-category]")];
const status=document.getElementById("portfolio-count");
function show(category){let count=0;
for(const card of cards){const visible=category==="all"||card.dataset.category===category;card.hidden=!visible;if(visible)count++}
for(const button of buttons)button.setAttribute("aria-pressed",String(button.dataset.projectFilter===category));
if(status)status.textContent="Showing "+count+" "+(count===1?"project":"projects");
}
for(const button of buttons)button.addEventListener("click",()=>show(button.dataset.projectFilter));
const initial=new URLSearchParams(location.search).get("type");
show(buttons.some(b=>b.dataset.projectFilter===initial)?initial:"all");
