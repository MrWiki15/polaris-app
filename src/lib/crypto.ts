const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const encodeBase64 = (bytes: Uint8Array) => {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const decodeBase64 = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const deriveKey = async (passphrase: string, salt: Uint8Array) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  return key;
};

//encriptar una cadena de texto
export const encrypt = async (plainText: string, passphrase: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(plainText),
  );
  const payload = {
    s: encodeBase64(salt),
    i: encodeBase64(iv),
    c: encodeBase64(new Uint8Array(cipherBuffer)),
  };
  return JSON.stringify(payload);
};

export const decrypt = async (payloadJson: string, passphrase: string) => {
  const payload = JSON.parse(payloadJson) as {
    s: string;
    i: string;
    c: string;
  };
  const salt = decodeBase64(payload.s);
  const iv = decodeBase64(payload.i);
  const cipher = decodeBase64(payload.c);
  const key = await deriveKey(passphrase, salt);
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher,
  );
  return textDecoder.decode(plainBuffer);
};

// enciptar y decript un objeto (para coleccion nft metadata)
export const encryptObject = async <T>(
  obj: T,
  passphrase: string,
): Promise<string> => {
  const jsonStr = JSON.stringify(obj);
  return encrypt(jsonStr, passphrase);
};

export const decryptObject = async <T>(
  payloadJson: string,
  passphrase: string,
): Promise<T> => {
  const decryptedStr = await decrypt(payloadJson, passphrase);
  return JSON.parse(decryptedStr) as T;
};
