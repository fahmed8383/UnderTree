import React from 'react';

import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import * as Y from "yjs";
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'

import randomColor from 'randomcolor';

import ReactQuill, { Quill } from 'react-quill';
import QuillCursors from 'quill-cursors';
import 'react-quill/dist/quill.snow.css';
import '../Styles/Editor.css'
import "highlight.js/styles/monokai-sublime.css";
import hljs from 'highlight.js'

Quill.register('modules/cursors', QuillCursors);

hljs.configure({
    languages: ['tex'],
    cssSelector: 'div.ql-editor > p'
})

const bindings = {
    'code exit': {
        key: 'Enter',
        collapsed: true,
        format: ['code-block'],
        prefix: /^$/,
        suffix: /^\s*$/,
        handler(range) {
          return true;
        },
    }
};

const modules = {
    cursors: true,
    keyboard: {
        bindings: bindings
    },
    syntax: {
        highlight: text => hljs.highlightAuto(text).value
    }
}

const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "code-block"
];

function Editor({documentID, setCurrentText}) {
    const username = localStorage.getItem("username");
    const [value, setValue] = useState('');
    const [modified, setModified] = useState(false);
    let quillRef = null;
    let edtRef = null;


    // Connect to socket when editor page is opened
    useEffect(() => {
        quillRef = edtRef.getEditor();
        const ydoc = new Y.Doc();   
        const provider = new WebsocketProvider('ws://localhost:8000', documentID, ydoc, {params: {jwt: "123"}});
        const ytext = ydoc.getText('quill');

        const awareness = provider.awareness; 
        
        const color = randomColor(); 
        
        awareness.setLocalStateField("user", {
          name: username,
          color: color,
        });


        new QuillBinding(ytext, edtRef.getEditor(), awareness);
    }, [])
    useEffect(() => {
        if (typeof edtRef.getEditor !== 'function') return;
            quillRef = edtRef.getEditor();
    })

    function onEditorChanged(content, delta, source, editor){
        setValue(content);
        quillRef.formatLine(0, quillRef.getLength(), { 'code-block': true });
        setCurrentText(editor.getText(content));

        if(!modified && source === "user"){
            console.log("Adding user to modified");    

            axios.post("http://localhost:8000/api/file/fileEdited", {
              username: username
            }, {
              withCredentials: true,
            }).then((res) => {
              console.log(res.data)
            }).catch((error) => {
              console.error(`Error Adding user to modified`);
            });

            setModified(true);
        }
    }

    return ( 
        <div id='container'>
            <ReactQuill 
                ref={(el) => { edtRef = el; }}
                theme="bubble"
                className="editor"
                modules={modules}
                formats={formats}
                value={value} 
                onChange={onEditorChanged}
                 />
        </div>
    )
}

export default Editor