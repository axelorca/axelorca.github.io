// CONSTANTS

const MAIN_BUTTONS = document.getElementsByClassName("mainButton");
const DROPDOWN_CONTENT = document.getElementsByClassName("dropdown-content");

// VARIABLES

let clickedMainButton = null;

// METHODS

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// MAIN
/////////////////////////////////

for(let i = 0; i < MAIN_BUTTONS.length; i++)
{
    MAIN_BUTTONS[i].removeAttribute("href");
    DROPDOWN_CONTENT[i].style = "height: 0px";

    let targetEvent = isMobile() ? "click" : "mouseenter";

    MAIN_BUTTONS[i].addEventListener(targetEvent, () => {
        clickedMainButton = MAIN_BUTTONS[i];

        for(let j = 0; j < MAIN_BUTTONS.length; j++)
        {
            if(j != i)
            {
                MAIN_BUTTONS[j].removeAttribute("href");
                DROPDOWN_CONTENT[j].style = "height: 0px";
            }
        } 

        const targetUrl = MAIN_BUTTONS[i].dataset.linkref;
        setTimeout(() => {
            if (targetUrl) {
                DROPDOWN_CONTENT[i].style = "height: 50px";
                MAIN_BUTTONS[i].setAttribute("href", targetUrl);
            }
        }, 1);
    });

    if(!isMobile())
    {
        MAIN_BUTTONS[i].addEventListener("mouseleave", () => {
            DROPDOWN_CONTENT[i].style = "height: 0px";
        })
    }
}

if(isMobile())
{
    document.addEventListener("click", () => {
        setTimeout(() => {
            if(!clickedMainButton)
            {
                for(let i = 0; i < MAIN_BUTTONS.length; i++)
                {
                    MAIN_BUTTONS[i].removeAttribute("href");
                    DROPDOWN_CONTENT[i].style = "height: 0px";
                }
            }
            clickedMainButton = null;
        }, 2);
    })
}