(() => {
    const file=document.getElementById("file");
    const canvas=document.getElementById("canvas");
    const ascii=document.getElementById("ascii-canvas");
    //const brightnessChars = " .:-=+*;/|!?"; //chara shading
    const brightnessChars = " MagictheGATHERING"; //mtg shading lol
    let ctx= canvas.getContext("2d");

    let img=new Image();
    img.crossOrigin="anonymous";

    const url = document.getElementById("imgurl");
    ctx.imageSmoothingEnabled = false;
    async function getData() {
        const cardName= document.getElementById("imgurl").value.trim();
        if (!cardName) {return;}
        const apiUrl= "https://api.scryfall.com/cards/named?fuzzy=" +encodeURIComponent(cardName); // card name search approx result

        try {
            const response=await fetch(apiUrl);
            if (!response.ok) {throw new Error(`Response status: ${response.status}`);}
            const result=await response.json();
            console.log(result);
            img.src= result.image_uris.large;
        } catch (error) {console.error(error.message);}
    }
  url.addEventListener("keydown", (event) => {if (event.key === "Enter") {getData();}
});

    function manipulate(iData, pad, context) {
        context.imageSmoothingEnabled = false;
        drawText(iData, pad, context);
    }

    function grayScale(iData) {
        let data = iData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg =
                (data[i]*0.21)+(data[i + 1]*0.71)+(data[i + 2] * 0.07);
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }
    }
    function getImage(img, ctx) {
        img.onload = function () {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0);

            let iData = ctx.getImageData(0,0,img.width,img.height);
            let asciiCtx = ascii.getContext("2d");
            ascii.width = img.width;
            ascii.height = img.height;

            manipulate(iData,ascii,asciiCtx);
        };
    }
    img.onload = function () {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);

        let iData = ctx.getImageData(0,0,img.width,img.height);
        let asciiCtx = ascii.getContext("2d");
        ascii.width = img.width;
        ascii.height = img.height;

        manipulate(iData,ascii,asciiCtx);
    };

    // ASCII part
    function drawText(iData, pad, context) {
      context.fillStyle = "#000";
      context.fillRect(0,0,pad.width,pad.height);
      context.textAlign = "left";
      context.textBaseline = "top";
      context.font = `10px "Open Sans`;
      for (let i = 0; i < iData.width; i += 8) {

          for (let j=0; j<iData.height;j += 8) {
              let n =(j* iData.width+i)*4;
              let r=iData.data[n];
              let g=iData.data[n + 1];
              let b=iData.data[n + 2];
              let value = (r*0.21)+(g*0.71) +(b*0.07);

              let charIndex= Math.floor(value/256*brightnessChars.length);
              charIndex=Math.min(charIndex, brightnessChars.length-1);
              let str = brightnessChars[charIndex];
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);

              r=((r - 128) * 1.5 + 128)*1.2;
              g=((g - 128) * 1.5 + 128)*1.2;
              b=((b - 128) * 1.5 + 128)*1.2;
              r=Math.max(0, Math.min(255, r));
              g=Math.max(0, Math.min(255, g));
              b=Math.max(0, Math.min(255, b));

              context.fillStyle=`rgb(${r}, ${g}, ${b})`;
              context.fillText(str,i,j);
          }
      }
  }
})();