/* File 1 */
/* GAME */
class BaC {
    constructor(digits = null,predef) {
        this.digits = digits;
        this.predef = predef;
    }
    lang = [
        '',
        'Number can not begin with "0"',
        'Number can not contain duplicated digits'
    ];
    set(secret) {
        var corrupted = this.validate(secret);
        if (corrupted) {
            return corrupted;
        }
        this.secret = secret;
        this.length = secret.length;
    }
    generate(number, dif = '1') {
        this.difficulty = dif;
        if(this.predef){
            this.set(this.predef);
            return;
        }
        var row = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]][Number(dif)]
        function gn(int = 0) {
            var ran = Math.floor(int + Math.random() * (row.length - 1));
            var value = row[ran];
            row.splice(ran, 1);
            return value;
        }
        var result = [String(gn(1))];
        --number;
        for (let i = 0; i < number; i++) {
            var n = gn();
            result.push(String(n));
        }
        this.set(result);
    }
    guess(guess) {
        var corrupted = this.validate(guess);
        if (corrupted) {
            return corrupted;
        }
        let bulls = 0;
        let cows = 0;

        let secretDigitCount = {};
        let guessDigitCount = {};

        for (let i = 0; i < this.length; i++) {
            if (this.secret[i] == guess[i]) {
                bulls++;
                if (this.difficulty === '0') {
                    [...this.digits.digits][i].correct = true;
                }
                else { [...this.digits.digits][i].correct = false; }
                [...this.digits.digits][i].almostCorrect = false;
            } else {
                [...this.digits.digits][i].correct = false;
                if (this.secret.indexOf(guess[i]) > -1) {
                    cows++;
                    if (this.difficulty === '0') {
                        [...this.digits.digits][i].almostCorrect = true;
                    }
                }
                else {
                    [...this.digits.digits][i].almostCorrect = false;
                }
            }
        }
        return { cor: bulls, inc: cows }
    }
    validate(text) {
        if (text[0] === '0') { return { issue: this.lang[1] } }
        var issue = text.filter((item, index) => text.indexOf(item) !== index);
        if (issue.length > 0) { return { issue: `${this.lang[2]} (${issue.join(',')})` } }
    }
};

/* File 2 */
/* UI Elements */
var container = document.querySelector('#bc_container');
class Digit {
    constructor(number = 0, parent, dif) {
        this.parent = parent;
        this._number = number;
        this._blocked = [];
        if (dif === 0 || dif === 1) {
            this.max = 9;
        }
        else { this.max = 15 }
        this.dom = document.createElement('div');
        this.dom.className = 'relative py-8 px-5';
        this.dom.innerHTML = this.structure();
        this.numberDOM = this.dom.querySelector('.number');
        this.validDOM = this.dom.querySelector('.valid');
        this.dom.querySelector('.increment').addEventListener('click', () => { this.increment.call(this); this.selected = false; });
        this.dom.querySelector('.decrement').addEventListener('click', () => { this.decrement.call(this); this.selected = false; });
        container.appendChild(this.dom);
    }
    get number() { return this._number; }
    set number(value) { this._number = value; this.numberDOM.innerHTML = this._number; }
    structure() {
        return `<div class="valid absolute inset-0 w-full h-full grid grid-rows-2">
                    <!-- background -->
                    <div class="increment"></div>
                    <div class="decrement"></div>
                </div>
                <div class="relative number">${this._number}</div>
                <!-- line -->
                <div class="absolute inset-0 w-full h-full flex items-center justify-center">
                <div class="h-px w-full bg-gray-800"></div>
                </div>`;
    }
    increment() {
        if (this._number < this.max) {
            if (this._blocked.indexOf(this._number + 1) > -1) { this._number++; this.increment(); return }
            this.number++
        }
        else {
            if (this._blocked.indexOf(0) > -1) { this._number = 0; this.increment(); return }
            this.number = 0;
        }
        this.check();
    }
    decrement() {
        if (this._number > 0) {
            if (this._blocked.indexOf(this._number - 1) > -1) { this._number--; this.decrement(); return }
            this.number--
        }
        else {
            if (this._blocked.indexOf(this.max) > -1) { this._number = this.max; this.decrement(); return }
            this.number = this.max;
        }
        this.check()
    }
    remove() {
        this.dom.parentElement.removeChild(this.dom);
    }
    block(number) {
        this._blocked.push(number); return this;
    }
    setMax(value) { this.max = value; return this; }
    check() {

        if (this.parent) { this.parent.areUnique() }
    }
    set valid(value) {
        if (value) {
            this.validDOM.classList.remove('invalid');
        }
        else {
            this.validDOM.classList.add('invalid');
        }
    }
    set correct(value) {
        if (value) {
            this.validDOM.classList.add('correct');
        }
        else {
            this.validDOM.classList.remove('correct');
        }
    }
    set almostCorrect(value) {
        if (value) {
            this.validDOM.classList.add('almostCorrect');
        }
        else {
            this.validDOM.classList.remove('almostCorrect');
        }
    }
    set selected(v) {
        if (v) { this.validDOM.parentElement.classList.add('selected') }
        else { this.validDOM.parentElement.classList.remove('selected') }
    }
}

class Digits {
    constructor(number, dif) {
        this.difficulty = Number(dif);
        this.digits = new Set();
        for (let i = 0; i < number; i++) {
            var c = i + 1;
            c != 10 ? this.add(c) : this.add(0)
            if (i == 0) { var ar = [...this.digits]; ar[ar.length - 1].block(0) }
        }
    }
    add(number) {
        this.digits.add(new Digit(number, this, this.difficulty));
    }
    remove(number) {
        this.digits.delete(number);
    }
    removeAll() {
        for (const [key, value] of this.digits.entries()) {
            value.remove();
            this.remove(value);
        }

    }
    calculate() {
        var answer = [];
        for (const [key, value] of this.digits.entries()) {
            answer.push(String(value.number));
        }
        return answer;
    }
    areUnique() {
        function setInvalid(ar) {
            ar.forEach(dom => {
                dom.valid = false;
            });
        }
        var doms = {};
        for (const [key, value] of this.digits.entries()) {
            if (!doms[value.number]) { doms[value.number] = [value]; value.valid = true; }
            else { doms[value.number].push(value); setInvalid(doms[value.number]) };
        }
    }
    solved() {
        for (const [key, value] of this.digits.entries()) {
            value.correct = true;
        }
    }
}

/* File 3 */
const LAN = 'LT';
const Trans = {
    LT: {
        'specifyNumber': 'Nurodykite skaitmenų skaičių',
        'start': 'Pradėti',
        'rulesH': 'Taisyklės',
        'selDific': 'Pasirinkite lygį',
        'easy': 'Lengvas',
        'medium': 'Vidutinis',
        'hard': 'Sunkus',
        'guess': 'Bandyti',
        'moves': 'Ėjimai',
        'number': 'Skaičius',
        'congrats': 'Sveikinimai!',
        'restart': 'Iš naujo',
        'selectDigit': 'Pasirinkite skaitmenys',
        'duplicate': 'Kopija',
        'wrongPos': 'Neteisinga pozicija',
        'correct': 'Teisinga',
        'bul':'Buliai',
        'cow':'Karvės',
        'gameCode':'Žaidimo kodas',
        'rulesB': `Žaidimo tikslas - atspėti skaičių. Jaučiai reiškia teisingus skaitmenis, kurie yra teisingose pozicijose, o karvės - teisingi skaitmenys, kurie yra neteisingose pozicijose.
Norėdami pradėti žaidimą, nurodykite skaitmenų skaičių, kurį norite atspėti, ir paspauskite "Pradėti".

Skaičius galima nurodyti pele arba klaviatūra (skaitmenys, rodyklės ir Enter).
`
    },
    EN: {
        'specifyNumber': 'Specify the number of digits',
        'duplicate': 'Duplicate',
        'guess': 'Guess',
        'wrongPos': 'Wrong position',
        'correct': 'Correct',
        'start': 'Start',
        'rulesH': 'Rules',
        'restart': 'Restart',
        'congrats': 'Congratulations!',
        'moves': 'Moves',
        'selDific': 'Select Difficulty',
        'selectDigit': 'Select digits',
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard',
        'bul':'Bul',
        'cow':'Cow',
        'number':'Number',
        'gameCode':'Game code',
        'rulesB': `Game requires you to guess the number.
Bulls represents correct digits which stays in the correct position, and cows are correct digits which stay in wrong position.

To begin game specify the number of digits you would like to guess and pres "Start"
Numbers can be specified by Mouse or Keyboard (digits, arrows and Enter)`
    }
}
var LG = Trans[LAN];
translateHTML();
/* PROCESS */
var task = null;
var setNumber = new Digit(4).block(0).setMax(10);
var digits = null;
var currentSelected = 0;
var button = document.querySelector('#bc_foot>button');
button.addEventListener('click', action);
var message = document.querySelector('#bc_foot>.message');
var info = document.querySelector('#bg_steps'); info.innerHTML = `<p>${LG.rulesB}</p>`;
document.querySelector('#bc_board .right>.head svg').addEventListener('click', restartGame);
var data = { steps: 0 };
var head = document.querySelector('#bc_header');
function action(event, button) {
    button = button || this;
    switch (button.innerText) {
        case LG.start: startGame(); button.innerText = LG.guess; break;
        case LG.guess: guessNumber(); break;
        case LG.restart: restartGame(); break;
    }
}
function startGame() {
    document.querySelector('#bc_board .right').classList.remove('rules');
    head.innerText = LG.selectDigit;
    info.innerHTML = `<div><span><a>${LG.moves}</a><a>${LG.number}</a></span><span><a>${LG.bul}</a><a>${LG.cow}</a></span></div>`;
    var number = setNumber.number;
    setNumber.remove();
    setNumber = null;
    var predef = document.querySelector('.sequence>input').value;
    var cPredef = predef;
    predef = predef?crypt(predef,true):false;
    var dif = document.querySelector('#difficulty').value;
    document.querySelector('#bc_board>.left>.help').style.display = dif == '0' ? 'unset' : 'none';
    digits = new Digits(predef?predef.length:number, dif);
    task = new BaC(digits,predef); task.generate(number, dif);
    keyLog(false);
    document.getElementById('seq').innerHTML=LG.gameCode+': '+(predef?cPredef:crypt(task.secret.join(',')));
    document.querySelector('#seq').removeAttribute('style');
    console.log(task.secret);
    document.querySelector('.sequence').style.display = 'none';
    document.querySelector('.sequence>input').innerHTML = '';
}
function guessNumber() {
    var answer = digits.calculate();
    var result = task.guess(answer);
    if (result.issue) { message.innerText = result.issue; return; }
    else { message.innerText = '' }
    var step = document.createElement('div');
    step.innerHTML = `<span><a>${++data.steps}:</a><a><span>${answer.join('</span><span>')}</span></a></span><span><a>${result.cor}</a><a>${result.inc}</a></span>`;
    //info.insertBefore(step, info.children[1]);
    info.appendChild(step)
    info.scroll({
        top: info.scrollHeight, //0,
        left: 0,
        behavior: 'smooth'
    });
    if (answer.join(',') === task.secret.join(',')) {
        button.innerText = LG.restart;
        digits.solved();
        info.children[info.children.length-1].style = 'background: #628867;color: white;';
        head.innerText = LG.congrats;
        boom();
    }
}
function restartGame() {
    document.querySelector('#bc_board .right').classList.add('rules');
    head.innerText = LG.specifyNumber;
    digits.removeAll();
    if (setNumber) { setNumber.remove() }
    setNumber = new Digit(4).block(0).setMax(10);
    data.steps = 0;
    button.innerText = LG.start;
    info.innerHTML = `<p>${LG.rulesB}</p>`;
    document.querySelector('#bc_board>.left>.help').style.display = 'none';
    document.querySelector('.sequence').removeAttribute('style');
    document.querySelector('#seq').style.display='none';
    document.getElementById('seq').innerHTML='';
    document.querySelector('.sequence>input').value='';
}
keyLog(true);
function keyLog(init = false) {
    if (init) { document.addEventListener('keydown', key) }
    function move(way) {
        if (setNumber) { return }
        [...digits.digits][currentSelected].selected = false;
        if (way) {
            if (currentSelected < digits.digits.size - 1) { currentSelected++ }
            else { currentSelected = 0 }
        }
        else {
            if (currentSelected > 0) { currentSelected-- }
            else { currentSelected = digits.digits.size - 1 }
        }
        [...digits.digits][currentSelected].selected = true;
    }
    function inc(move) {
        if (setNumber) { move ? setNumber.increment() : setNumber.decrement(); setNumber.selected = true; }
        else {
            var current = [...digits.digits][currentSelected];
            move ? current.increment() : current.decrement();
            current.selected = true;
        }
    }
    function key(event) {
        switch (event.key) {
            case 'Space': case 'Enter': action(null, button); return;
            case 'ArrowLeft':event.preventDefault();event.stopPropagation();move(false); return;
            case 'ArrowRight':event.preventDefault();event.stopPropagation();move(true); return;
            case 'ArrowUp': event.preventDefault();event.stopPropagation();inc(true); return;
            case 'ArrowDown': event.preventDefault();event.stopPropagation();inc(false); return;
            case 'F5': window.location.reload(); return;
            case 'F12': alert('Answer is:'+task.secret.join(',')); return;
        }
        var numb = Number(event.key);
        if (isNaN(numb)) { return }
        if (setNumber) {
            if (setNumber._blocked.indexOf(String(numb)) === -1) {
                setNumber.number = String(numb);
            }
            return;
        }
        var current = [...digits.digits][currentSelected];
        if (current) {
            if (current._blocked.indexOf(numb) > -1) { return }
            current.number = numb;
            current.parent.areUnique();
        }
        move(true);
    }
}
function translateHTML() {
    var doms = [...document.querySelectorAll('*[LG]')];
    doms.forEach((el) => {
        var text = LG[el.getAttribute('LG')] || 'UNKNOWN';
        el.innerText = text;
    })
}
function crypt(text, dec) {
    var alpha = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
    var secret = '';
    var key = dec ? alpha.indexOf(text[0]) : Math.floor(Math.random() * (35 - 2 + 1) + 2);
    if([3,6,9,12,15,17,18,21,24,27,30,33,34].indexOf(key)>-1){return crypt(text, dec)}
    (function shafl() {
        var al = alpha.length;
        var i = key;
        while (secret.length < al) {
            secret += alpha[i];
            i += key;
            if (i >= al) { i = i - al+1;}
        }
    })()
    if (!dec) {
        var ans = '';
        text=text.split(',');
        text.forEach((el) => {
            ans += secret[Number(el) + key];
        })
        return alpha[key] + ans;
    }
    else{
        var ans = [];
        text = text.slice(1).split('');
        text.forEach((el) => {
            ans.push(String(secret.indexOf(el)-key));
        })
        return ans;
    }
}

/* File 4 */
function boom() {
    var count = 200;
    var defaults = {
        origin: { y: 0.8 }
    };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}
