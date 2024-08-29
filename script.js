document.getElementById('encryptBtn').addEventListener('click', () => {
    processFile('encrypt');
});

document.getElementById('decryptBtn').addEventListener('click', () => {
    processFile('decrypt');
});

function processFile(action) {
    const fileInput = document.getElementById('fileInput');
    const password = document.getElementById('password').value;

    if (fileInput.files.length === 0) {
        alert("Please upload a file.");
        return;
    }

    if (!password) {
        alert("Please enter a key.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        let processedData;

        if (action === 'encrypt') {
            processedData = encrypt(arrayBuffer, password);
        } else if (action === 'decrypt') {
            processedData = decrypt(arrayBuffer, password);
        }

        if (processedData) {
            downloadFile(processedData, file.name, action);
        }
    };

    reader.readAsArrayBuffer(file);
}

function encrypt(arrayBuffer, password) {
    const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer));
    const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();
    return encrypted;
}

function decrypt(arrayBuffer, password) {
    try {
        const encryptedStr = new TextDecoder().decode(new Uint8Array(arrayBuffer));
        const decrypted = CryptoJS.AES.decrypt(encryptedStr, password);
        const decryptedWords = decrypted.words;
        const decryptedBytes = new Uint8Array(decrypted.sigBytes);

        for (let i = 0; i < decrypted.sigBytes; i++) {
            decryptedBytes[i] = (decryptedWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }

        return decryptedBytes.buffer;
    } catch (e) {
        alert("Decryption failed. Invalid key or corrupted data.");
        return null;
    }
}

function downloadFile(data, filename, action) {
    if (!data) return;

    let blob;
    if (action === 'encrypt') {
        blob = new Blob([data], { type: "text/plain" });
    } else {
        blob = new Blob([data], { type: "application/octet-stream" });
    }

    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = (action === 'encrypt' ? 'encrypted_' : 'decrypted_') + filename;

    document.getElementById('downloadContainer').style.display = 'block';
}

