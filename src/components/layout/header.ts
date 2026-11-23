import Component from "../component.ts";
import ApiButton from "../shared/api-button.ts";
import GitHubButton from "./github-button.ts";
import LanguageSwitch from "../shared/language-switch.ts";
import StaquiaLogo from "./staquia-logo.ts";

/** The top bar. */
export default class Header extends Component {
  render(): string {
    return `
<header class="header">
  ${new StaquiaLogo()}
  <h1>Staquia</h1>
  <span class="filler"></span>
  ${new LanguageSwitch(true)}
  ${new GitHubButton()}
  ${new ApiButton()}
</header>`;
  }
}
