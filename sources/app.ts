﻿declare var text: HTMLTextAreaElement;
declare var textvertical: HTMLTextAreaElement;
declare var height: HTMLInputElement;
declare var extraspace: HTMLInputElement;

//TODO: 높이 대신 너비로 설정하기도 가능하게
class Serolizer {
    private regexDictionary = {
        '。': /\./g,
        '？': /\?/g,
        '（': /\)/g,
        '）': /\(/g,
        '／': /\//g,
        '　': /( |\t)/g,
    }
    private quotationDictionary = {
        '「」＇': '\'',
        '『』』': '"',
    }
    private charDictionary = {
        '、': ',',
        '！': '!',
        '＠': '@',
        'ㅣ': '-',//Hangul hack
        '「': '‘',
        '」': '’',
        '『': '“',
        '』': '”',
    }

    constructor() {
        const list = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｘｙｘｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ".split('');
        const dict = this.charDictionary;
        list.forEach(function (char) {
            dict[char] = String.fromCharCode(char.charCodeAt(0) - 65248);
        });
    }

    convert(target: string, height: number) {
        const lines = this.replaceToFullWidth(target).split("\n");
        const results: string[][] = [];
        lines.forEach((line) => {
            results.push(this.transformDirection(line, height));
        });

        const mergedLineArray = this.mergeMultipleTransformedArrays(results);
        return this.mergeLines(this.optimizeLines(mergedLineArray));
    }

    private mergeLines(lines: string[]) {
        let merged = '';
        lines.forEach((line) => {
            merged += line + "\r\n";
        });
        return merged;
    }

    private replaceToFullWidth(target: string) {
        for (var fullwidth in this.regexDictionary)
            target = target.replace(<RegExp>this.regexDictionary[fullwidth], fullwidth);
        for (var fullwidth in this.charDictionary)
            target = target.replace(new RegExp(this.charDictionary[fullwidth], 'g'), fullwidth);
        return this.replaceQuotations(target);
    }

    private replaceQuotations(target: string) {
        for (var quotationmark in this.quotationDictionary) {
            let first = true;
            const match = target.match(new RegExp(this.quotationDictionary[quotationmark], 'g'));
            if (match) {
                const regexp = new RegExp(this.quotationDictionary[quotationmark])
                for (var i = 0; i < Math.floor(match.length / 2) * 2; i++) {
                    if (first)
                        target = target.replace(regexp, quotationmark[0]);
                    else
                        target = target.replace(regexp, quotationmark[1]);
                    first = !first;
                }
                if (first && match.length != Math.floor(match.length / 2) * 2)
                    target = target.replace(regexp, quotationmark[2]);
            }
        }
        return target;
    }

    private transformDirection(target: string, height: number) {
        const result = '';
        const splitted = this.splitByLength(target, height);
        //this.getTransformedEmptyArray(splitted).forEach((str: string) => {
        //    result += str + "\r\n";
        //});

        return this.getTransformedArray(splitted);
    }

    private splitByLength(target: string, height: number) {
        const result: string[] = [];
        while (target.length > height) {
            result.push(this.fillSpace(target.slice(0, height), height));
            target = target.slice(height);
        }
        result.push(this.fillSpace(target, height));
        return result;
    }

    private fillSpace(target: string, length: number) {
        while (target.length < length)
            target += '　';
        return target;
    }

    private getTransformedArray(strarray: string[]) {
        const insertExtraSpace = extraspace.checked;
        const resultarray = [];
        for (let i = 0; i < strarray[0].length; i++) {
            resultarray.push('');
        }

        if (insertExtraSpace)
            for (let i = 0; i < resultarray.length; i++)
                for (let i2 = strarray.length - 1; i2 >= 0; i2--)
                    resultarray[i] += '　' + strarray[i2][i];
        else 
            for (let i = 0; i < resultarray.length; i++)
                for (let i2 = strarray.length - 1; i2 >= 0; i2--)
                    resultarray[i] += strarray[i2][i];
        return resultarray;
    }

    private mergeTransformedArrays(strarray1: string[], strarray2: string[]) {
        const result: string[] = [];
        for (let i = 0; i < strarray1.length; i++)
            result.push(strarray2[i] + strarray1[i]);
        return result;
    }

    private mergeMultipleTransformedArrays(strarrays: string[][]) {
        let result = strarrays[0];
        strarrays = strarrays.splice(1);
        while (strarrays.length > 0) {
            result = this.mergeTransformedArrays(result, strarrays[0]);
            strarrays = strarrays.splice(1);
        }
        return result;
    }

    private optimizeLines(strarray: string[]) {
        const resultarray: string[] = [];
        const insertExtraSpace = extraspace.checked;
        strarray.forEach((str) => {
            if (insertExtraSpace)
                str = str.slice(1);
            while (str[str.length - 1] === '　')
                str = str.slice(0, str.length - 1);
            resultarray.push(str);
        });
        while (resultarray[resultarray.length - 1].length == 0)
            resultarray.pop();
        return resultarray;
    }
}
function convert() {
    textvertical.innerHTML = new Serolizer().convert(text.value, <number><any>height.value).replace(/\n/g, '<br />');
}
function selectAll() {
    const range = document.createRange();
    range.selectNodeContents(textvertical);
    getSelection().addRange(range);
}
function getImage() {
    const popup = window.open();
    setImage(popup.document);
}
function setImage(doc: Document) {
    while (doc.body.firstChild)
        doc.body.removeChild(doc.body.firstChild);
    const img = doc.createElement('img');
    img.src = Imagenator.convertText(new Serolizer().convert(text.value, <number><any>height.value));
    doc.body.appendChild(img);
}
document.addEventListener("DOMContentLoaded", () => convert());