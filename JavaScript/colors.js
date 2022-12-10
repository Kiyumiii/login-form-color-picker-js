let context = {}

addEventListener('load', async () => {
    let dataOnBrowser = JSON.parse(localStorage.getItem("context"));

    //If no data, create it
    if(!dataOnBrowser) {
        const firstColor = document.querySelector(`.color-picker`);
        context.color = firstColor.dataset.color
        context.type = []

        switch (firstColor.dataset.color) {
            case "RANDOM":
                context.type = "RANDOM"
                break;
            case "CUSTOM":
                context.type = "CUSTOM"
                break;
            default:
                context.type = "INPUT"
                break;
        }

        await localStorage.setItem("context", JSON.stringify(context));
        dataOnBrowser = JSON.parse(localStorage.getItem("context"));
    }

    let colorInput;
    if(dataOnBrowser.type !== "INPUT") {
        colorInput = await document.querySelector(`[data-color="${dataOnBrowser.type}"]`);
    } else {
        colorInput = await document.querySelector(`[data-color="${dataOnBrowser.color}"]`);
    }
    colorInput.classList.add("active")
    document.querySelector("#btn-login").style.setProperty("color", getContrastYIQ(dataOnBrowser.color));
    document.querySelector(":root").style.setProperty("--accent", dataOnBrowser.color); 
});

var colorPicker = document.querySelectorAll(".color-picker")
colorPicker.forEach(color => {
    let dataColor = color.dataset.color;
    color.style.backgroundColor = dataColor;
    color.addEventListener("click", async () => {
        switch (dataColor) {
            case 'RANDOM':
                colorChangeOnClick(generateHex(), "RANDOM")
              break;
            case 'CUSTOM':
                let color = document.querySelector('#btn-color');
                color.value = getComputedStyle(document.documentElement).getPropertyValue('--accent');
                document.querySelectorAll(".color-picker").forEach(color => color.classList.remove("active"))
                event.target.parentNode.classList.add("active")
                color.addEventListener('input', () => {
                    let hexValue = event.target.value;
                    if(!hexValue.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/g)) return;
                    colorChangeOnClick(hexValue, "CUSTOM")
                })
              break;
            case 'COPY':
                async function copy() {
                    let text = "#" + getComputedStyle(document.documentElement).getPropertyValue('--accent').slice(1);

                    navigator.permissions.query({ name: "clipboard-write" }).then(async (result) => {
                        if(!(result.state == "granted" || result.state == "prompt")){
                            return alert("Something went wrong, you might want to check your browser's settings!");
                        }
                        
                        try {
                            await navigator.clipboard.writeText(text);
                            alert("Color copied to clipboard!");
                        }
                        catch (err) {
                            alert("Something went wrong, you might want to check your browser's settings!");
                        }
                    });
                }
                  document.querySelector("#btn-copy").addEventListener("click", copy());
                break;
            default:
                colorChangeOnClick(dataColor, "INPUT")
          }
    })
})

function generateHex() {
    let hexValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"]
    let hex = "#"
    for (var i = 0; i < 6; i++){
        hex += hexValues[Math.floor(Math.random() * hexValues.length)]
    }
    return hex;
}

function getContrastYIQ(hexColor){
    let hexColorInput = ""
    if(hexColor.startsWith("#")) hexColor = hexColor.slice(1)
    if(hexColor.length === 3) {
        for(var i = 0; i < hexColor.length; i++){
            hexColorInput = hexColorInput + (hexColor[i] + hexColor[i]);
         }
    } else {
        hexColorInput = hexColor;
    }
	let r = parseInt(hexColorInput.substr(0,2),16);
	let g = parseInt(hexColorInput.substr(2,2),16);
	let b = parseInt(hexColorInput.substr(4,2),16);
	let yiq = ((r*299)+(g*587)+(b*114))/1000;
    document.querySelector("meta[name=\"theme-color\"]").setAttribute("content", hexColor)
	return (yiq >= 128) ? '#333' : 'white';
}

function colorChangeOnClick(color, inputType) {
    context.color = color
    context.type = inputType
    localStorage.setItem("context", JSON.stringify(context));
    console.log(localStorage.getItem("context"))

    document.querySelector(":root").style.setProperty("--accent", color);
    document.querySelector("#btn-login").style.setProperty("color", getContrastYIQ(color));
    document.querySelectorAll(".color-picker").forEach(color => color.classList.remove("active"))
    if(inputType === "CUSTOM") { event.target.parentNode.classList.add("active") }
    else { event.target.classList.add("active") }
}