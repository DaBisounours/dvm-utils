<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/DaBisounours/dvm-utils">
    <img src="logo.svg" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">dvm-utils</h3>

  <p align="center">
    Toolset to parse and generate DVM code
    <br /><!--
    <a href="https://github.com/DaBisounours/dvm-utils"><strong>Explore the docs »</strong></a> 
    <br />
    <br />
    <a href="https://github.com/DaBisounours/dvm-utils">View Demo</a>
    ·-->
    <a href="https://github.com/DaBisounours/dvm-utils/issues">Report Bug</a>
    ·
    <a href="https://github.com/DaBisounours/dvm-utils/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS ->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>
-->


<!-- ABOUT THE PROJECT -->
## About The Project

This tool helps typescript developpers parse and generate [DVM-BASIC](https://docs.dero.io/Developers/dvm/) code. DVM-BASIC is the language used by the Dero Virtual Machine on the [DERO](https://dero.io) blockchain. 



### Built With

* [![Ohm.js]][Ohm.js] ([website](https://ohmjs.org/))
* [![Typescript]][Typescript]



<!-- GETTING STARTED -->
## Getting Started

This package is written in Typescript and can be used in any Node or browser app.

### Prerequisites


* `npm` or `yarn`
  
### Installation

* Install package
   ```sh
   # with NPM
   npm install dvm-utils
   ```
   ```sh
   # with yarn
   yarn add dvm-utils
   ```


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

* Parse a DVM-BASIC program :
```ts
import { parse } from 'dvm-utils'
import { Program } from 'dvm-utils/src/types/program'

const code: string = `
Function Initialize() Uint64
  10 RETURN 0
End Function
`;

const program: Program = parse(code);

console.log(program)
```
*WIP: build a program and generate code. Check out src/tests folders for undocumented examples*
<!--
_For more examples, please refer to the [Documentation](https://example.com)_
-->
<p align="right">(<a href="#readme-top">back to top</a>)</p>

* Generate code from the `Program` data structure

```ts

import { generate } from "dvm-utils";
import { Program, FunctionType, DVMType } from "dvm-utils/src/types/program";
import { return_value } from "dvm-utils/src/lib/build";

const initializeFunction: FunctionType = {
  name: "Initialize",
  return: DVMType.Uint64,
  args: [],
  statements: [return_value(0, 10)],
};
const program: Program = {
  functions: [initializeFunction],
};
const { code } = generate(program);

console.log({ code });
```
should output
```basic
Function Initialize() Uint64
  10  RETURN 0
End Function
```

  * Generation options
```ts

const { code } = generate(program, {
  minify: false, // Minifies the variable/function names. Makes the code harder to read.
  optimizeSpace: true, // Removes any unnecessary space
  comments: false, // Leaves comments in the code
});
```

<!-- ROADMAP -->
## Roadmap

- [x] Parsing DVM-BASIC code
- [x] Program building utilities
- [ ] Generate code from a Program

See the [open issues](https://github.com/DaBisounours/dvm-utils/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING 
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

-->

<!-- LICENSE 
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
-->


<!-- CONTACT -->
## Contact

Project Link: [https://github.com/DaBisounours/dvm-utils](https://github.com/DaBisounours/dvm-utils)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
<!-- 
## Acknowledgments

* []()
* []()
* []()

<p align="right">(<a href="#readme-top">back to top</a>)</p>
-->


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/DaBisounours/dvm-utils.svg?style=for-the-badge
[contributors-url]: https://github.com/DaBisounours/dvm-utils/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/DaBisounours/dvm-utils.svg?style=for-the-badge
[forks-url]: https://github.com/DaBisounours/dvm-utils/network/members
[stars-shield]: https://img.shields.io/github/stars/DaBisounours/dvm-utils.svg?style=for-the-badge
[stars-url]: https://github.com/DaBisounours/dvm-utils/stargazers
[issues-shield]: https://img.shields.io/github/issues/DaBisounours/dvm-utils.svg?style=for-the-badge
[issues-url]: https://github.com/DaBisounours/dvm-utils/issues
[license-shield]: https://img.shields.io/github/license/DaBisounours/dvm-utils.svg?style=for-the-badge
[license-url]: https://github.com/DaBisounours/dvm-utils/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png

[Typescript]: https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=for-the-badge


[Ohm.js]: https://shields.io/badge/Ohm.js-555?logo=NPM&logoColor=FFF&style=for-the-badge
