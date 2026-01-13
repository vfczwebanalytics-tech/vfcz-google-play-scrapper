import translate from "./lib/translate.js";

export function translateToEnglish(text, inputLang = "auto") {
  return new Promise((resolve, reject) => {
    const options =
      inputLang && inputLang !== "auto"
        ? { input: inputLang, output: "English" }
        : { output: "English" };

    translate.text(options, text, (err, translatedText) => {
      if (err) return reject(err);
      resolve(translatedText);
    });
  });
}
