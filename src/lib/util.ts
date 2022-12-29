import Color from 'color';
import saveFile from 'save-as-file/dist/save-file';

export function openFile(callBack) {
	const element = document.createElement('input');
	element.setAttribute('type', 'file');
	element.setAttribute('id', 'btnOpenFile');
	element.onchange = function () {
		readText(this, callBack);
		document.body.removeChild(this);
	};

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();
}

export function readText(filePath, callBack) {
	var reader;
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		reader = new FileReader();
	} else {
		alert('The File APIs are not fully supported by your browser. Fallback required.');
		return false;
	}
	var output = ''; //placeholder for text output
	if (filePath.files && filePath.files[0]) {
		reader.onload = function (e) {
			output = e.target.result;
			callBack(output);
		}; //end onload()
		reader.readAsText(filePath.files[0]);
	} //end if html5 filelist support
	else {
		//this is where you could fallback to Java Applet, Flash or similar
		return false;
	}
	return true;
}

export const saveToFile = (content, name) => {
	const json = JSON.stringify(content);
	const file = new File([json], { type: 'application/json' });
	saveFile(file, name);
};

function isNeighborLink(node, link) {
	return link.target.id === node.id || link.source.id === node.id;
}

export function getLinkColor(node, link) {
	return isNeighborLink(node, link) ? 'green' : '#E5E5E5';
}

export function getNeighbors(node, links) {
	return links.reduce(
		(neighbors, link) => {
			if (link.target === node.id || link.target?.id === node.id) {
				neighbors.push(link.source.id);
			} else if (link.source === node.id || link.source?.id === node.id) {
				neighbors.push(link.target.id);
			}
			return neighbors;
		},
		[node.id]
	);
}

const colors = ['gray', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink'];
export function getNodeColor(node, neighbors, nodes) {
	const ns = nodes
		.filter((n) => neighbors.includes(n.id) && typeof n.group !== 'undefined')
		.map((n) => n.group);
	const ind = typeof node.group !== 'undefined' ? node.group : Math.max(...ns);
	const clr = colors[ind] || 'black';

	return typeof node.group === 'undefined' ? Color(clr).lighten(0.4) : clr;
}

export function getTextColor(node, neighbors) {
	return neighbors.indexOf(node.id) ? 'green' : 'black';
}
