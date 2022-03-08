# Teensy - Getting Started
## Quick start information about the Teensy microcontroller board
### 2022-03-08

### About

Describe the software resource and explain its relevance to your topic. Please include the link to the software resource.

- The Teensy board is an open source development board designed for speed and accessibility. It is useful in the areas of electrical engineering and audio design because of its ability to handle digital signals. In the physics and chemistry world, it is used for taking fast measurements of particle interactions.
- The newest Teensy board, the Teensy 4.1, boasts clock speeds of up to 600MHz, which is groundbreaking considering it is an accessible microcontroller.
- The Teensy board includes a large standard library that includes tooling for audio, USB serial, direct memory access, and state machine management.
- https://www.pjrc.com/teensy/
![Teensy 4.1](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fhackaday.com%2Fwp-content%2Fuploads%2F2020%2F05%2Fteensy-4.1-cover.jpg&f=1&nofb=1)

### Table of Contents

* [Features](https://github.com/Allegheny-ComputerScience-580-S2022/lab01-simojo/blob/main/writing/tutorial.md#features)
* [Obtaining the resource](https://github.com/Allegheny-ComputerScience-580-S2022/lab01-simojo/blob/main/writing/tutorial.md#obtaining-the-resource)
* [Setup](https://github.com/Allegheny-ComputerScience-580-S2022/lab01-simojo/blob/main/writing/tutorial.md#setup)
* [Execution](https://github.com/Allegheny-ComputerScience-580-S2022/lab01-simojo/blob/main/writing/tutorial.md#execution)
* [Helpful resources](https://github.com/Allegheny-ComputerScience-580-S2022/lab01-simojo/blob/main/writing/tutorial.md#helpful-resources)

---

### Features

Outline the main features of the software. Why is this software necessary for your work?

- Compatible with Arduino development
- Free software development tools
- Supports most major operating systems
- Small form factor
- Can achieve clock speeds of 600MHz
- Relatively inexpensive
- Has up to 34 I/O pins for great versatility

---

### Obtaining the resource

Where do you find this software resource? Is it an open source project? an online tool? How do you install it? Are there any libraries that are also necessary to install?

- To purchase the Teensy, visit https://www.pjrc.com/teensy/.
- To flash the device, download the Teensy loader for your operting system at pjrc.com/teensy/loader.html
- Install the GCC compiler along with associated libraries
   - Macintosh OS X
     - `avr-gcc-select 4`
   - Linux, Ubuntu 8.10
     - `sudo apt-get install gcc-avr binutils-avr avr-libc`
   - Windows
     - Download [WinAVR](http://winavr.sourceforge.net/download.html)
- Preferably, you can install [PlatformIO](platformio.org)'s [Teensy development environment](https://docs.platformio.org/en/latest/platforms/teensy.html) for its ease of use
  - [Install PlatformIO on your system](https://docs.platformio.org/en/latest/core/installation.html)

---

### Setup

Include steps of all necessary steps to get the software to run (for example, installations). Include the commands to run if necessary.

- Assuming you have PlatformIO installed
  - `pio project init --project-dir YOUR_DIRECTORY --board teensyXX`, where `XX` corresponds to the Teensy version you purchased
  - `cd YOUR_DIRECTORY`
  - Edit `src/main.c`
  - `pio run` (compiling code)
  - This step should produce a multi-hundred line output if it's the first time running it. If this step works, then you have a functioning PlatformIO development environment for the Teensy microcontroller board!

---

### Execution

How do you get the resource ready to use? Are there inputs to know? Please show a step-by-step guide (in a tutorial format) for readying the resource for your work. Include screenshots of successful execution and use of the software.

- Configure your `platformio.ini` file
  - under `[env:teensyXX]`, ensure the following exists
    ```ini
    # this configures the board build
    platform = teensy
    framwork = arduino
    board = teensyXX
    upload_protocol = teensy-cli
    ```
- `pio run` will run scripts made by you
  - `pio run --target upload` will create a `.hex` file for you to flash
  - if this does not work, you can manually copy the hex file using:
    ```sh
    pio run --target upload # builds again; ignore uploading errors
    cp ./.pio/build/teensyXX/firmware.hex ./teensyXX.hex
    teensy-loader-cli --mcu=teensyXX teensyXX.hex # teensy-loader-cli will already be installed via PlatformIO
    ```
  - here is a sample output of running `pio run`:
    ```sh
    Processing teensy41 (platform: teensy; framework: arduino; board: teensy35)
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    Verbose mode can be enabled via `-v, --verbose` option
    CONFIGURATION: https://docs.platformio.org/page/boards/teensy/teensy35.html
    PLATFORM: Teensy (4.13.1) > Teensy 3.5
    HARDWARE: MK64FX512 120MHz, 255.99KB RAM, 512KB Flash
    DEBUG: Current (jlink) External (jlink)
    PACKAGES:
    - framework-arduinoteensy 1.154.0 (1.54)
    - toolchain-gccarmnoneeabi 1.50401.190816 (5.4.1)
    LDF: Library Dependency Finder -> https://bit.ly/configure-pio-ldf
    LDF Modes: Finder ~ chain, Compatibility ~ soft
    Found 93 compatible libraries
    Scanning dependencies...
    Dependency Graph
    |-- <Audio> 1.3
    |   |-- <SerialFlash>
    |   |   |-- <SPI> 1.0
    |   |-- <SPI> 1.0
    |   |-- <Wire> 1.0
    |   |-- <SD> 2.0.0
    |   |   |-- <SdFat> 2.0.5-beta.1
    |   |   |   |-- <SPI> 1.0
    |-- <SD> 2.0.0
    |   |-- <SdFat> 2.0.5-beta.1
    |   |   |-- <SPI> 1.0
    |-- <SPI> 1.0
    |-- <SerialFlash>
    |   |-- <SPI> 1.0
    |-- <Wire> 1.0
    Building in release mode
    Linking .pio/build/teensy41/firmware.elf
    Checking size .pio/build/teensy41/firmware.elf
    Advanced Memory Usage is available via "PlatformIO Home > Project Inspect"
    RAM:   [          ]   3.4% (used 8800 bytes from 262136 bytes)
    Flash: [          ]   3.0% (used 15508 bytes from 524288 bytes)
    Building .pio/build/teensy41/firmware.hex
    =============================================================================== [SUCCESS] Took 1.95 seconds ===============================================================================
    ```

---

### Helpful resources

Include some of the relevant resources (links, articles, etc.) that you used to write in your tutorial.

- https://docs.platformio.org/en/latest/core/index.html

---
