### Easily manage a QNAP Network Attached Storage with useful commands

# Configuration

Create a `config.properties` file with the following properties:
- `__MAC_ADDRESS__`: Devide MAC address (used for Wake-on-Lan)
- `__MOUNT_DIR__`: Directory where the shares will be mounted (eg. `/media`)
- `__ADDRESS__`: Network address of the NAS
- `__SYNC_CONFIG_FILE__`: Configuration file for directory synchronization

# Installation

Installation requires [`wx-pm`](https://github.com/RaffaeleCanale/wx-pm)

`cd` to the project directory and run:
```
wx install
```

