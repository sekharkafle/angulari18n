let doms = [];
let translations = {};
let hasFetched = false;
const serviceUrl = "";
function updatElement(element, text){
    element.style.border = "3px solid green";
   /* if(element.getAttribute("translation-name")){
        let needsAdd = true;
        let tn = element.getAttribute("translation-name");
        if(tn.includes("||")){
            let splits = tn.split("||");
            if(splits.includes(text)){
                needsAdd = false;
            }
        } else if (text === tn){
            needsAdd = false;
        }
        if(needsAdd){
            tn = tn + "||" + text;
            element.setAttribute("translation-name", tn);
        }
    } else {
        element.setAttribute("translation-name", text);
    }*/
    let tss = element.getAttribute("translation-name");
    if(tss){
        if(!tss.includes(text)){
            tss.push(text);
            element.setAttribute("translation-name", tss);
        }
    } else {
        tss = [];
        tss.push(text);
        element.setAttribute("translation-name", tss);
    }

    function pp(e){
        //console.log('attr:', e.srcElement.getAttribute("translation-name"));
        //document.getElementById("orig_txt").innerText = "";
        //document.getElementById("trans_txt").value = "";
        const popover = document.getElementById("my-popover");

        popover.showPopover();
        let ts = "";
        translations.translation.forEach(t=>{
            if(e.srcElement.getAttribute("translation-name").trim() === t.original){
                ts = t.translation;
            }
        })
        document.getElementById("orig_txt").innerText = e.srcElement.getAttribute("translation-name") + " ";
        document.getElementById("trans_txt").value = ts;
        
    }
    element.onmouseover = (event) => {pp(event);};
}

function handleDoms(){
    console.log(doms.length)
    doms.forEach((e)=>{
        domTraversal(e);
    })
}

function domTraversal(text){
    if(!text){
        return;
    }
    const targetText = text;
    const xpath = `//*[@*="${targetText}"] | //*[text()="${targetText}"] | //*[@content="${targetText}"]`;
    const result = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null,);
    let node = null;
    for (let i=0;i<result.snapshotLength; i++){
        node = result.snapshotItem(i);
        //console.log('updating')
        updatElement(node, text);
    }
}

async function callTranslationService(){
    /*try {
        const data = {translateMessage: {language:"spanish",text:doms.join('\n')}};
        const res = await fetch(serviceUrl, {
          method: 'POST',
          body: JSON.stringify(data)
        })
        // handle the error
        if (!res.ok) throw new Error(await res.text())
        translations = await res.json();
        translations = JSON.parse(translations)
    console.log(translations["translation"])
    console.log(translations);
      } catch (e) {
        // Handle errors here
        console.error(e)
      }*/
      const res = await fetch("assets/translation.txt");
      if (!res.ok) throw new Error(await res.text())
        translations = await res.text();
        translations = JSON.parse(translations)
        //console.log(translations["translation"])
}

function updateTranslation(){
    if(doms.length === 0){
        if(hasFetched){
            return;
        } else{
            hasFetched = true;
        }
        fetch("assets/messages.xml").then((response) => response.text())
        .then((xmlString) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            const sources = xmlDoc.querySelectorAll("source");
            sources.forEach((source)=>{
                doms.push(source.textContent);
            });
            callTranslationService();
            handleDoms();
        });
    }else {
        handleDoms();
    }
}

function callback(mutationList, observer){
    let shouldSkip = false;
    mutationList.forEach((mutation)=>{
        if(shouldSkip){
            return;
        }
        if(mutation.type === "childList"){
            updateTranslation();
            shouldSkip = true;
        }
    });
}

const observer = new MutationObserver(callback);
const config = {childList:true, subtree:true};
observer.observe(document.body, config);

