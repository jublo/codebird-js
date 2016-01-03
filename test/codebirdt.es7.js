import Codebird from "../codebird";

/**
 * A Twitter library in JavaScript
 *
 * @package   codebird-test
 * @version   3.0.0-dev
 * @author    Jublo Solutions <support@jublo.net>
 * @copyright 2010-2016 Jublo Solutions <support@jublo.net>
 * @license   http://opensource.org/licenses/GPL-3.0 GNU Public License 3.0
 * @link      https://github.com/jublonet/codebird-php
 */

/**
 * A Twitter library in JavaScript
 *
 * @package codebird-test
 */
export default class CodebirdT extends Codebird {

  /**
   * Returns properties
   *
   * @param string property The property to get
   *
   * @return mixed Property
   */
  get(property) {
    if (typeof this.property !== "undefined") {
      return this.property;
    }
    throw `Property ${property} is not defined.`;
  }

  /**
   * Returns static properties
   *
   * @param string property The property to get
   *
   * @return mixed Property
   */
  getStatic(property) {
    if (typeof CodebirdT.property !== "undefined") {
      return CodebirdT.property;
    }
    throw `Static property ${property} is not defined.`;
  }

  /**
   * Calls methods
   *
   * @param string method The method to call
   * @param mixed  params The parameters to send along
   *
   * @return mixed Return value
   */
  call(method, params = []) {
    if (typeof this[method] === "function") {
      return this[method].apply(this, params);
    }
    throw `Method ${method} is not defined.`;
  }

  /**
   * Calls static methods
   *
   * @param string method The method to call
   * @param mixed  params The parameters to send along
   *
   * @return mixed Return value
   */
  callStatic(method, params = []) {
    if (typeof CodebirdT[method] === "function") {
      return CodebirdT[method].apply(this, params);
    }
    throw `Static method ${method} is not defined.`;
  }

/*
// Unit testing code
    this.__test = {
    call: (name, params = []) => this[name].apply(this, params),
    get: name => this[name],
    mock: methods_to_mock => {
        for (let name in methods_to_mock) {
        if (methods_to_mock.hasOwnProperty(name)) {
            this[name] = methods_to_mock[name];
        }
        }
    }
    };
*/
}
