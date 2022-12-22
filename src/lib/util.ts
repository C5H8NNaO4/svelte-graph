import { onMount } from "svelte";

export function openFile(callBack){
    var element = document.createElement('input');
    element.setAttribute('type', "file");
    element.setAttribute('id', "btnOpenFile");
    element.onchange = function(){
        readText(this,callBack);
        document.body.removeChild(this);
        }
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  }
  
  export function readText(filePath,callBack) {
      var reader;
      if (window.File && window.FileReader && window.FileList && window.Blob) {
          reader = new FileReader();
      } else {
          alert('The File APIs are not fully supported by your browser. Fallback required.');
          return false;
      }
      var output = ""; //placeholder for text output
      if(filePath.files && filePath.files[0]) {           
          reader.onload = function (e) {
              output = e.target.result;
              callBack(output);
          };//end onload()
          reader.readAsText(filePath.files[0]);
      }//end if html5 filelist support
      else { //this is where you could fallback to Java Applet, Flash or similar
          return false;
      }       
      return true;
  }

  export const useSocket = (url) => {
    let socket;

    onMount(() => {
        const s = new WebSocket(url);
        socket = s;
    });

    return socket;
  }