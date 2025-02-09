
import * as constants from "../constants.js";

import { db } from './firebase-init.js';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';


export function sendHighlightMessage(color, tab){
    chrome.tabs.sendMessage(tab.id, {
        action: constants.ActionType.HIGHLIGHT,
        highlightColor: color,
        key : constants.MessageKeys.ANNOTATION, 
    }, (response) => {
        if (chrome.runtime.lastError && !chrome.runtime.lastError.message.includes("Could not establish connection. Receiving end does not exist")
            && !chrome.runtime.lastError.message.includes("The message port closed before a response was received")) {
            console.error("error sending message" + chrome.runtime.lastError.message);
        }
    });
}
export function sendSummarizeMessage(tab){
    chrome.tabs.sendMessage(tab.id, {
        action: constants.ActionType.SUMMARIZE,
        key: constants.MessageKeys.ANNOTATION
    });
}
export function sendTextstyleMessage(textstyleType, tab){
    chrome.tabs.sendMessage(tab.id, {
        action: constants.ActionType.TEXTSTYLE,
        textstyleType: textstyleType,
        key : constants.MessageKeys.ANNOTATION
    }, (response) => {
        if (chrome.runtime.lastError && !chrome.runtime.lastError.message.includes("Could not establish connection. Receiving end does not exist")
            && !chrome.runtime.lastError.message.includes("The message port closed before a response was received")) {
            console.error("error sending message" + chrome.runtime.lastError.message);
        }
    });
}
export function sendCommentMessage(tab){
    chrome.tabs.sendMessage(tab.id, {
        action: constants.ActionType.COMMENT,
        commentMessage: "type to enter text",
        key: constants.MessageKeys.ANNOTATION
    }, (response) => {
        if (chrome.runtime.lastError && !chrome.runtime.lastError.message.includes("Could not establish connection. Receiving end does not exist")
            && !chrome.runtime.lastError.message.includes("The message port closed before a response was received")) {
            console.error("error sending message" + chrome.runtime.lastError.message);
        }
    });
}


export function sendGenerateMessage(tab) {
    console.log("sending generate message");
    chrome.tabs.sendMessage(tab.id, {
        action: constants.ActionType.GENERATE,
        key: constants.MessageKeys.GENERATE
    }, (response) => {
        if (chrome.runtime.lastError && !chrome.runtime.lastError.message.includes("Could not establish connection. Receiving end does not exist")
            && !chrome.runtime.lastError.message.includes("The message port closed before a response was received")) {
            console.error("error sending message" + chrome.runtime.lastError.message);
        }
    });
}




export function sendClearMessage(tab){
    chrome.tabs.sendMessage(tab.id, {
        action: constants.ActionType.CLEAR,
        key: constants.MessageKeys.ANNOTATION
    }, (response) => {
        if (chrome.runtime.lastError && !chrome.runtime.lastError.message.includes("Could not establish connection. Receiving end does not exist")
            && !chrome.runtime.lastError.message.includes("The message port closed before a response was received")) {
            console.error("error sending message" + chrome.runtime.lastError.message);
        }
    });
}
export function getHighlightColor(id){
    return id.split('_')[1];
}
export function getTextstyleType(id){
    return id.split('_')[1];
}
export function getCurrentTabUrl(){
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
            if (chrome.runtime.lastError){
                return reject(chrome.runtime.lastError);
            }
            if (tabs.length > 0){
                resolve(tabs[0].url);
            }
            else{
                reject("No active tab found");
            }
        });
    });
}



export async function saveAnnotationToDatabase(annotation) {
    const markupDocRef = doc(db, 'markups', annotation.markup_key);

    // Get the current document
    const docSnap = await getDoc(markupDocRef);
    if (!docSnap.exists()) {
        // If the document doesn’t exist, create it
        await setDoc(markupDocRef, { annotations: [annotation] });
        return;
    }

    let annotations = docSnap.data().annotations || [];

    // Find existing annotation by ID
    const existingIndex = annotations.findIndex(a => a.id === annotation.id);

    if (existingIndex !== -1) {
        // If annotation exists, check if it is different
        if (JSON.stringify(annotations[existingIndex]) === JSON.stringify(annotation)) {
            return; // No change, do nothing
        }

        // Replace existing annotation with updated one
        annotations[existingIndex] = annotation;
    } else {
        // If annotation does not exist, add it
        annotations.push(annotation);
    }

    // Update Firestore only if there's a change
    await updateDoc(markupDocRef, { annotations });
}


