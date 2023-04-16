/*! jsShell.js | https://github.com/francoisburdy/js-shell-emulator */

class JsShell {
  // Prompt types
  static PROMPT_INPUT = 1;
  static PROMPT_PASSWORD = 2;
  static PROMPT_CONFIRM = 3;
  static PROMPT_PAUSE = 4;

  constructor(container, options = {}) {
    if (typeof container === 'string') {
      if (container.charAt(0) === '#') {
        container = container.substring(1);
      }
      this.containerNode = document.getElementById(container);
      if (!this.containerNode) {
        throw new Error(`Failed instantiating JsShell object: dom node with id "${container}" not found in document.`);
      }
    } else if (container instanceof Element) {
      this.containerNode = container;
    } else {
      throw new Error('JsShell constructor requires parameter "container" to be a dom Element or node string ID');
    }

    this.html = document.createElement('div');
    this.html.setAttribute('tabindex', 0);
    this.html.className = options.className || 'jsShell';
    this._innerWindow = document.createElement('div');
    this._output = document.createElement('p');
    this._promptPS1 = document.createElement('span');
    this._inputLine = document.createElement('span'); // the span element where the users input is put
    this.cursorType = options.cursorType || 'large';
    this.cursorSpeed = options.cursorSpeed || 500;
    this.makeCursor();
    this._input = document.createElement('div'); // the full element administering the user input, including cursor
    this._shouldBlinkCursor = true;
    this.cursorTimer = null;
    this._input.appendChild(this._promptPS1);
    this._input.appendChild(this._inputLine);
    this._input.appendChild(this._cursor);
    this._innerWindow.appendChild(this._output);
    this._innerWindow.appendChild(this._input);
    this.html.appendChild(this._innerWindow);

    this.setBackgroundColor(options.backgroundColor || '#000')
      .setFontFamily(options.fontFamily || 'Ubuntu Mono, Monaco, Courier, monospace')
      .setTextColor(options.textColor || '#fff')
      .setTextSize(options.textSize || '1em')
      .setForceFocus(options.forceFocus !== false)
      .setPrompt(options.promptPS || '')
      .setWidth(options.width || '100%')
      .setHeight(options.height || '300px')
      .setMargin(options.margin || '0');

    this.html.style.overflowY = options.overflow || 'auto';
    this.html.style.whiteSpace = options.whiteSpace || 'break-spaces';
    this._innerWindow.style.padding = options.padding || '10px';
    this._input.style.margin = '0';
    this._output.style.margin = '0';
    this._input.style.display = 'none';

    this.containerNode.innerHTML = '';
    this.containerNode.appendChild(this.html);
  }

  makeCursor() {
    if (this.cursorType === 'large') {
      this._cursor = document.createElement('span');
      this._cursor.innerHTML = 'O'; // put something in the cursor...
    } else {
      this._cursor = document.createElement('div');
      this._cursor.style.borderRightStyle = 'solid';
      this._cursor.style.borderRightColor = 'white';
      this._cursor.style.height = '1em';
      this._cursor.style.borderRightWidth = '3px';
      this._cursor.style.paddingTop = '0.15em';
      this._cursor.style.paddingBottom = '0.15em';
      this._cursor.style.position = 'absolute';
      this._cursor.style.zIndex = '1';
      this._cursor.style.marginTop = '-0.15em';
    }
    this._cursor.className = 'cursor';
    this._cursor.style.display = 'none'; // then hide it
  }

  print(message) {
    const newLine = document.createElement('div');
    newLine.textContent = message;
    this._output.appendChild(newLine);
    this.scrollBottom();
    return this;
  }

  newLine() {
    const newLine = document.createElement('br');
    this._output.appendChild(newLine);
    this.scrollBottom();
    return this;
  }

  write(message) {
    const newLine = document.createElement('span');
    newLine.innerHTML = `${message}`;
    this._output.appendChild(newLine);
    this.scrollBottom();
    return this;
  }

  async type(message, speed = 50) {
    const newLine = document.createElement('span');
    newLine.style.borderRight = `${this.cursorType === 'large' ? '9px' : '3px'} solid ${this._cursor.style.color}`;
    this._output.appendChild(newLine);
    const timeout = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };
    for await (const char of message) {
      await timeout(speed);
      newLine.textContent += char;
      this.scrollBottom();
    }
    newLine.style.borderRight = 'none';
  }

  printHTML(content) {
    const newLine = document.createElement('div');
    newLine.innerHTML = `${content}`;
    this._output.appendChild(newLine);
    this.scrollBottom();
    return this;
  }

  fireCursorInterval() {
    if (this.cursorTimer) {
      clearTimeout(this.cursorTimer);
    }
    this.cursorTimer = setTimeout(() => {
      if (this._shouldBlinkCursor) {
        this._cursor.style.visibility = this._cursor.style.visibility === 'visible' ? 'hidden' : 'visible';
        this.fireCursorInterval();
      } else {
        this._cursor.style.visibility = 'visible';
      }
    }, this.cursorSpeed);
  };

  scrollBottom() {
    this.html.scrollTop = this.html.scrollHeight;
    return this;
  }

  async _prompt(message = '', promptType) {
    return new Promise(async(resolve) => {
      const shouldDisplayInput = (promptType === JsShell.PROMPT_INPUT || promptType === JsShell.PROMPT_CONFIRM);
      const inputField = document.createElement('input');
      inputField.setAttribute('autocapitalize', 'none');
      inputField.style.position = 'relative';
      inputField.style.zIndex = '-100';
      inputField.style.outline = 'none';
      inputField.style.border = 'none';
      inputField.style.opacity = '0';
      inputField.style.top = '0'; // prevents from viewport scroll moves

      this._inputLine.textContent = '';
      this._input.style.display = 'block';
      this.html.appendChild(inputField);
      this.fireCursorInterval();

      // Show input message
      if (message.length) {
        if (promptType !== JsShell.PROMPT_PAUSE) {
          this.printHTML(promptType === JsShell.PROMPT_CONFIRM ? `${message} (y/n)` : message);
        }
      }

      inputField.onblur = () => {
        this._cursor.style.display = 'none';
      };

      inputField.onfocus = () => {
        inputField.value = this._inputLine.textContent;
        this._cursor.style.display = 'inline-block';
      };

      this.html.onclick = () => {
        if (this.shouldFocus()) {
          inputField.focus();
        }
      };

      inputField.onkeydown = (e) => {
        if (e.code === 'ArrowUp' || e.code === 'ArrowRight' || e.code === 'ArrowLeft' || e.code === 'ArrowDown' || e.code === 'Tab') {
          e.preventDefault();
        }
        // keep cursor visible while active typing
        this._cursor.style.visibility = 'visible';
      };

      inputField.onkeyup = (e) => {
        this.fireCursorInterval();
        const inputValue = inputField.value;
        if (shouldDisplayInput && !this.isKeyEnter(e)) {
          this._inputLine.textContent = inputField.value;
        }

        if (promptType === JsShell.PROMPT_CONFIRM && !this.isKeyEnter(e)) {
          if (!this.isKeyYorN(e)) { // PROMPT_CONFIRM accept only "Y" and "N"
            this._inputLine.textContent = inputField.value = '';
            return;
          }
          if (this._inputLine.textContent.length > 1) { // PROMPT_CONFIRM accept only one character
            this._inputLine.textContent = inputField.value = this._inputLine.textContent.substr(-1);
          }
        }

        if (promptType === JsShell.PROMPT_PAUSE) {
          inputField.blur();
          this.html.removeChild(inputField);
          this.scrollBottom();
          resolve();
          return;
        }

        if (this.isKeyEnter(e)) {
          if (promptType === JsShell.PROMPT_CONFIRM) {
            if (!inputValue.length) { // PROMPT_CONFIRM doesn't accept empty string. It requires answer.
              return;
            }
          }
          this._input.style.display = 'none';
          if (shouldDisplayInput) {
            this.printHTML(this._promptPS1.innerHTML + inputValue);
          }
          if (promptType === JsShell.PROMPT_CONFIRM) {
            const confirmChar = inputValue.toUpperCase()[0];
            if (confirmChar === 'Y') {
              resolve(true);
            } else if (confirmChar === 'N') {
              resolve(false);
            } else {
              throw new Error(`PROMPT_CONFIRM failed: Invalid input (${confirmChar}})`);
            }
          } else {
            resolve(inputValue);
          }
          this.html.removeChild(inputField); // remove input field in the end of each callback
          this.scrollBottom(); // scroll to the bottom of the terminal
        }
      };
      if (this.shouldFocus()) {
        inputField.focus();
      }
    });
  }

  async expect(cmdList, inputMessage, notFoundMessage) {
    let cmd = await this.input(inputMessage);
    while (!cmdList.includes(cmd)) {
      cmd = await this.input(notFoundMessage);
    }
    return cmd;
  }

  async input(message) {
    return await this._prompt(message, JsShell.PROMPT_INPUT);
  }

  async pause(message) {
    this._promptPS1_backup = this._promptPS1.innerHTML;
    this.setPrompt(message);

    await this._prompt(message, JsShell.PROMPT_PAUSE);

    this.setPrompt(this._promptPS1_backup);
    this._promptPS1_backup = '';
  }

  async password(message) {
    return await this._prompt(message, JsShell.PROMPT_PASSWORD);
  }

  async confirm(message) {
    return await this._prompt(message, JsShell.PROMPT_CONFIRM);
  }

  clear() {
    this._output.innerHTML = '';
    return this;
  }

  static async sleep(milliseconds) {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  setTextSize(size) {
    this._output.style.fontSize = size;
    this._input.style.fontSize = size;
    return this;
  }

  setForceFocus(focus) {
    this._forceFocus = !!focus;
    return this;
  }

  setTextColor(col) {
    this.html.style.color = col;
    this._cursor.style.background = col;
    this._cursor.style.color = col;
    this._cursor.style.borderRightColor = col;
    return this;
  }

  setFontFamily(font) {
    this.html.style.fontFamily = font;
    return this;
  }

  setBackgroundColor(col) {
    this.html.style.background = col;
    return this;
  }

  setWidth(width) {
    this.html.style.width = width;
    return this;
  }

  setHeight(height) {
    this.html.style.height = height;
    return this;
  }

  setMargin(margin) {
    this.html.style.margin = margin;
    return this;
  }

  setBlinking(bool) {
    bool = bool.toString().toUpperCase();
    this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES');
    return this;
  }

  setPrompt(promptPS) {
    this._promptPS1.innerHTML = promptPS;
    return this;
  }

  isKeyEnter(event) {
    return event.keyCode === 13 || event.code === 'Enter';
  }

  isKeyYorN(event) {
    if (event.code) {
      return event.code === 'KeyY' || event.code === 'KeyN';
    }

    // fix for Chrome Android
    let kCd = event.keyCode || event.which;
    if (event.srcElement && (kCd === 0 || kCd === 229)) {
      const val = event.srcElement.value;
      kCd = val.charCodeAt(val.length - 1);
    }
    // Y and N lowercase & uppercase char codes
    return [121, 89, 78, 110].includes(kCd);
  }

  setVisible(visible) {
    this.html.style.display = visible ? 'block' : 'none';
    return this;
  }

  shouldFocus() {
    return this._forceFocus ||
      this.html.matches(':focus-within') ||
      this.html.matches(':hover');
  }

  focus(force = false) {
    const lastChild = this.html.lastElementChild;
    if (lastChild && (this.shouldFocus() || force)) {
      lastChild.focus();
    }
    return this;
  }
}

module.exports =  { JsShell };
