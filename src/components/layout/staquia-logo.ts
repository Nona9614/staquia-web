import Component from "../component.ts";

/** The Staquia logo. It is decorative: the title next to it already says "Staquia". */
export default class StaquiaLogo extends Component {
  render(): string {
    return `
<img
  class="logo"
  alt=""
  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHESURBVFhH7Ze7SsRAFIYzuYiXwkYsrH2DLXwKL6UguIWLheATKLgKvoTYWAgiFupbWPgGLlqINlY2C7psnDPOhJM4rmzmD07Y/SDM5ISEb8+cuawIJFOnZym1vtJtNYXwXdKQEyVz3fUC7hbq1jtJgjtlor4zmqJze9cpXfoWCkyUC1YhCxG1iaFlnUUHCSFls3UUsTwZsbfjNdhSZ/zqN+t93Eq50697vSkF/vyv2MzjrIqZoR/mXRWQ2GJEbYY+l9HzpYbulWP74kG1J+uLqnVl4+5e91hGXSWrgDtBh54yicpmkfotT74zFkUzFkUzmqK7V51g57IT9NPcNg0hE+Xb1SBIgjRsKr0+XfREnSuc4U7W01OZkw51pp/k6Uk+pdMTxWIhlPL71ubQ31MBRqmhj0MRRFKCo75c+HxPZv8TVAa5jJpfVJb5/ZuUSgP1V4S7ZRl1lSS+qxcHd4LOehrlQkXAyIa+bEYXDm7TD5ruBUg4icLg5XDFSd34OWeURJLopwtNOFdJDmToX49Wc7ITcahi+hYCrEaN7GQSQTNpgE4mkn1uL8MlCaholdRP1La//jfcyXoo8RFV+L7LdltN8QVCRNSVQ4KWnwAAAABJRU5ErkJggg=="
/>`;
  }
}
