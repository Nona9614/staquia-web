import Component from "../component.ts";

/** A link to the TypeDoc API documentation (served from `api/` next to this page). */
export default class ApiButton extends Component {
  render(): string {
    // No whitespace inside the link: a space there would render inside the button, not between it and the next word
    return `<a class="api-button" href="api/index.html"><i aria-hidden="true">📚</i><span class="api-button__text">API</span></a>`;
  }
}
