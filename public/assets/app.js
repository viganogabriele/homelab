/* =====================================================================
   homelab.vigab.cc · public showcase

   DATA holds every piece of text on the page and the whole public map.
   The rendering code further down contains no copy: edit DATA, reload,
   then run `node check.mjs` before deploying.

   THIS SITE IS PUBLIC. Never put addresses, ports, internal host or
   container names, real domain records, people's names, e-mails or keys
   in here. Use generic names ("Reverse proxy", "NAS", ...).

   Map model (coordinates in the viewBox DATA.map.view):
   - zones: background areas (cloud / home).
   - groups: containers that are themselves selectable (hypervisor, NAS...).
   - nodes: boxes. state = active | ondemand | planned.
   - edges: type (vpn | web | lan | dns | backup), from/to, pts = orthogonal
     polyline, label = [x, y] for the short label (text in map.text.edges),
     both = traffic in both directions. "lan" is the home-network backbone.
   - services: what a visitor can "reach". routes[].legs = lists of edge ids
     ("-id" walks an edge backwards). needs = what must work for the route
     ({ node, edges?, at?, rel }); nodes inside a host group also depend on
     the host automatically.
   - map.text.nodes[id] = [name, subtitle, description, short name for the map]
   ===================================================================== */
const DATA = {
  "site": {
    "domain": "homelab.vigab.cc",
    "home": "homelab.vigab.cc",
    "storageKey": "homelab-site"
  },
  "page": {
    "skip": "Skip to the map",
    "brandMain": "homelab.vigab.cc",
    "brandSub": "",
    "brandLabel": "homelab.vigab.cc, back to top",
    "navLabel": "Sections",
    "nav": [
      {
        "href": "#map",
        "label": "Map"
      },
      {
        "href": "#principles",
        "label": "Principles"
      },
      {
        "href": "#stack",
        "label": "Stack"
      }
    ],
    "themeToLight": "Switch to light theme",
    "themeToDark": "Switch to dark theme",
    "hero": {
      "eyebrow": "A self-hosted homelab",
      "title": [
        {
          "text": "A small homelab."
        },
        {
          "text": " A closer look.",
          "accent": true,
          "br": true
        }
      ],
      "lede": "A home for files, photos and home automation, built with self-hosted tools. Explore the roles behind the services and how they depend on each other.",
      "ctaPrimary": {
        "href": "#map",
        "label": "Explore the map"
      },
      "ctaSecondary": {
        "href": "#principles",
        "label": "How it is designed"
      },
      "orbit": {
        "label": "Illustration: the home at the centre, its services around it, and remote devices on an outer ring.",
        "center": {
          "icon": "home",
          "label": "Home"
        },
        "inner": [
          {
            "icon": "server",
            "label": "Hypervisor",
            "tone": "lan"
          },
          {
            "icon": "disk",
            "label": "NAS",
            "tone": "dns"
          },
          {
            "icon": "photo",
            "label": "Photos",
            "tone": "web"
          },
          {
            "icon": "bulb",
            "label": "Smart home",
            "tone": "lan"
          }
        ],
        "outer": [
          {
            "icon": "laptop",
            "label": "Laptop",
            "tone": "vpn"
          },
          {
            "icon": "shield",
            "label": "Edge",
            "tone": "backup"
          },
          {
            "icon": "phone",
            "label": "Phone",
            "tone": "vpn"
          },
          {
            "icon": "vps",
            "label": "Cloud VPS",
            "tone": "vpn"
          },
          {
            "icon": "cloud",
            "label": "Off-site",
            "tone": "backup"
          }
        ]
      }
    },
    "mapHead": {
      "eyebrow": "Interactive map",
      "title": "Explore the connections",
      "lede": "Choose a destination to follow its role in the system and the components it depends on. This is a simplified public diagram; deployment routes and access controls are omitted."
    },
    "principles": {
      "eyebrow": "Design principles",
      "title": "A few rules, applied everywhere",
      "lede": "Practical choices for a small system that is easier to understand and maintain.",
      "items": [
        {
          "icon": "lock",
          "title": "Encrypt remote connections",
          "text": "Encrypted VPN tools support remote access. The public diagram shows their roles without documenting deployment routes or access rules."
        },
        {
          "icon": "key",
          "title": "Sign in with passkeys",
          "text": "The self-hosted cloud storage uses an identity provider with passkeys. This reduces reliance on reusable passwords."
        },
        {
          "icon": "backup",
          "title": "Keep more than one copy",
          "text": "Snapshots support recovery from unwanted changes. An encrypted off-site copy adds a separate destination."
        },
        {
          "icon": "eye",
          "title": "Keep responsibilities separate",
          "text": "Compute, storage, application routing and identity have distinct roles. Understanding those dependencies makes changes easier to assess."
        },
        {
          "icon": "doc",
          "title": "Keep the system understandable",
          "text": "Documentation explains everyday use, component roles and maintenance. Keeping it current makes the system easier to understand and maintain."
        }
      ]
    },
    "stack": {
      "eyebrow": "Stack",
      "title": "What it runs on",
      "lede": "Open-source tools, grouped by role. Configuration details stay in private documentation.",
      "groups": [
        {
          "icon": "server",
          "tone": "lan",
          "title": "Compute",
          "items": [
            [
              "Proxmox VE",
              "virtualization"
            ],
            [
              "Linux containers",
              "service isolation"
            ],
            [
              "Virtual machines",
              "application workloads"
            ]
          ]
        },
        {
          "icon": "disk",
          "tone": "dns",
          "title": "Storage",
          "items": [
            [
              "TrueNAS",
              "storage management"
            ],
            [
              "ZFS snapshots",
              "point-in-time copies"
            ],
            [
              "Encrypted cloud sync",
              "off-site copy"
            ]
          ]
        },
        {
          "icon": "mesh",
          "tone": "vpn",
          "title": "Access",
          "items": [
            [
              "WireGuard",
              "encrypted VPN"
            ],
            [
              "Tailscale",
              "mesh VPN"
            ],
            [
              "Dynamic DNS",
              "address updates"
            ]
          ]
        },
        {
          "icon": "shield",
          "tone": "backup",
          "title": "Web and identity",
          "items": [
            [
              "Traefik",
              "reverse proxy"
            ],
            [
              "Let’s Encrypt",
              "certificate authority"
            ],
            [
              "OpenID Connect",
              "identity integration"
            ],
            [
              "Passkeys",
              "sign-in"
            ]
          ]
        },
        {
          "icon": "photo",
          "tone": "web",
          "title": "Apps",
          "items": [
            [
              "Immich",
              "photo library"
            ],
            [
              "Home Assistant",
              "smart home"
            ],
            [
              "Cloud storage",
              "self-hosted file sync and sharing"
            ]
          ]
        }
      ]
    },
    "footer": {
      "owner": "homelab.vigab.cc",
      "note": "No cookies, trackers or analytics. A simplified public diagram with generic names.",
      "copyright": "© {year} "
    }
  },
  "ui": {
    "pickTitle": "Choose what you want to reach",
    "pickHint": "The map lights up the path and what it depends on.",
    "pickLabel": "Destinations",
    "overviewChip": "Overview",
    "overviewTitle": "The whole homelab",
    "overviewDesc": "Explore the roles behind the services. Lines show conceptual relationships, not published endpoints or deployment routes. Choose a destination or select a box for details.",
    "kService": "Path",
    "kOverview": "Overview",
    "path": "Path",
    "needs": "Depends on",
    "hostRel": "hosting",
    "depTag": "depends on",
    "stepsTitle": "Step by step",
    "stepsIdle": "Pick a destination and its path appears here, one hop at a time.",
    "ifDown": "Related services in this diagram",
    "ifDownNone": "No related service is shown in this simplified diagram.",
    "partOf": "Lives in",
    "contains": "Contains",
    "clickHint": "Select it to see what depends on it",
    "play": "Resume animations",
    "pause": "Pause animations",
    "zoomIn": "Zoom in",
    "zoomOut": "Zoom out",
    "fit": "Fit selection",
    "full": "Show the whole map",
    "toolsLabel": "Map view",
    "legendTypes": "Links",
    "legendStates": "State",
    "legendDep": "dependency",
    "close": "Close",
    "routeAll": "All",
    "ellipsis": "…",
    "routes": "Variants",
    "then": ", then ",
    "mapTitle": "Map of the homelab",
    "mapDesc": "A simplified diagram of client devices, cloud services, an ISP router, a hypervisor and storage systems. Deployment routes and access controls are omitted.",
    "nodeAria": "{name}: {sub}. Press Enter for details.",
    "hint": "Zoom in for labels; drag sideways to pan on touch. Scroll vertically to keep reading. Use the steps below to open any component."
  },
  "map": {
    "view": {
      "w": 1400,
      "h": 790
    },
    "states": {
      "active": "--st-active",
      "ondemand": "--st-ondemand",
      "planned": "--st-planned"
    },
    "edgeTypes": [
      "vpn",
      "web",
      "lan",
      "dns",
      "backup"
    ],
    "zones": [
      {
        "id": "cloud",
        "x": 268,
        "y": 10,
        "w": 1116,
        "h": 204,
        "label": [
          1370,
          30,
          "end"
        ]
      },
      {
        "id": "home",
        "x": 16,
        "y": 316,
        "w": 1368,
        "h": 458,
        "label": [
          36,
          337,
          "start"
        ]
      }
    ],
    "groups": [
      {
        "id": "away",
        "cls": "g-out",
        "x": 16,
        "y": 10,
        "w": 236,
        "h": 204,
        "icon": "users",
        "tone": "vpn",
        "label": [
          30,
          31,
          "start"
        ]
      },
      {
        "id": "hyp",
        "cls": "g-hyp",
        "x": 36,
        "y": 346,
        "w": 770,
        "h": 262,
        "icon": "server",
        "tone": "lan",
        "label": [
          792,
          580,
          "end"
        ],
        "sub": [
          792,
          597,
          "end"
        ],
        "host": true
      },
      {
        "id": "nas",
        "cls": "g-nas",
        "x": 822,
        "y": 346,
        "w": 548,
        "h": 262,
        "icon": "disk",
        "tone": "dns",
        "label": [
          1356,
          580,
          "end"
        ],
        "sub": [
          1356,
          597,
          "end"
        ],
        "host": true
      }
    ],
    "router": {
      "id": "router",
      "x": 16,
      "y": 240,
      "w": 1368,
      "h": 50,
      "label": [
        1100,
        262
      ],
      "sub": [
        1100,
        280
      ],
      "icon": "router",
      "tone": "lan"
    },
    "bus": {
      "id": "lan",
      "y": 652,
      "x1": 48,
      "x2": 1000,
      "label": [
        600,
        652
      ],
      "tone": "lan"
    },
    "nodes": [
      {
        "id": "phone",
        "parent": "away",
        "x": 36,
        "y": 46,
        "w": 196,
        "h": 56,
        "icon": "phone",
        "tone": "vpn",
        "state": "active"
      },
      {
        "id": "laptop",
        "parent": "away",
        "x": 36,
        "y": 146,
        "w": 196,
        "h": 56,
        "icon": "laptop",
        "tone": "vpn",
        "state": "active"
      },
      {
        "id": "vps",
        "x": 290,
        "y": 46,
        "w": 150,
        "h": 56,
        "icon": "vps",
        "tone": "vpn",
        "state": "active"
      },
      {
        "id": "mesh",
        "x": 290,
        "y": 146,
        "w": 150,
        "h": 56,
        "icon": "mesh",
        "tone": "vpn",
        "state": "active"
      },
      {
        "id": "ca",
        "x": 462,
        "y": 46,
        "w": 166,
        "h": 56,
        "icon": "lock",
        "tone": "dns",
        "state": "active"
      },
      {
        "id": "dns",
        "x": 670,
        "y": 46,
        "w": 150,
        "h": 56,
        "icon": "globe",
        "tone": "dns",
        "state": "active"
      },
      {
        "id": "offsite",
        "x": 1205,
        "y": 146,
        "w": 160,
        "h": 56,
        "icon": "cloud",
        "tone": "backup",
        "state": "active"
      },
      {
        "id": "vpngw",
        "parent": "hyp",
        "x": 60,
        "y": 395,
        "w": 165,
        "h": 60,
        "icon": "key",
        "tone": "vpn",
        "state": "active"
      },
      {
        "id": "meshnode",
        "parent": "hyp",
        "x": 245,
        "y": 395,
        "w": 165,
        "h": 60,
        "icon": "mesh",
        "tone": "vpn",
        "state": "active"
      },
      {
        "id": "proxy",
        "parent": "hyp",
        "x": 430,
        "y": 395,
        "w": 165,
        "h": 60,
        "icon": "proxy",
        "tone": "web",
        "state": "active"
      },
      {
        "id": "ddns",
        "parent": "hyp",
        "x": 615,
        "y": 395,
        "w": 165,
        "h": 60,
        "icon": "refresh",
        "tone": "dns",
        "state": "active"
      },
      {
        "id": "smart",
        "parent": "hyp",
        "x": 60,
        "y": 495,
        "w": 165,
        "h": 60,
        "icon": "home",
        "tone": "lan",
        "state": "active"
      },
      {
        "id": "idp",
        "parent": "hyp",
        "x": 430,
        "y": 495,
        "w": 165,
        "h": 60,
        "icon": "key",
        "tone": "web",
        "state": "active"
      },
      {
        "id": "cloud",
        "parent": "hyp",
        "x": 615,
        "y": 495,
        "w": 165,
        "h": 60,
        "icon": "cloud",
        "tone": "web",
        "state": "active"
      },
      {
        "id": "photos",
        "parent": "nas",
        "x": 1015,
        "y": 395,
        "w": 160,
        "h": 60,
        "icon": "photo",
        "tone": "web",
        "state": "active"
      },
      {
        "id": "shares",
        "parent": "nas",
        "x": 835,
        "y": 495,
        "w": 160,
        "h": 60,
        "icon": "folder",
        "tone": "lan",
        "state": "active"
      },
      {
        "id": "snaps",
        "parent": "nas",
        "x": 1015,
        "y": 495,
        "w": 160,
        "h": 60,
        "icon": "backup",
        "tone": "backup",
        "state": "active"
      },
      {
        "id": "replica",
        "x": 1195,
        "y": 680,
        "w": 170,
        "h": 60,
        "icon": "disk",
        "tone": "backup",
        "state": "planned"
      }
    ],
    "edges": [
      {
        "id": "e_away_dns",
        "type": "dns",
        "from": "away",
        "to": "dns",
        "both": true,
        "pts": [
          [
            252,
            34
          ],
          [
            745,
            34
          ],
          [
            745,
            46
          ]
        ],
        "label": [
          380,
          34
        ]
      },
      {
        "id": "e_away_vpn",
        "type": "vpn",
        "from": "away",
        "to": "vpngw",
        "pts": [
          [
            120,
            214
          ],
          [
            120,
            395
          ]
        ],
        "label": [
          120,
          334
        ]
      },
      {
        "id": "e_vpn_lan",
        "type": "lan",
        "from": "vpngw",
        "to": "lan",
        "pts": [
          [
            60,
            440
          ],
          [
            48,
            440
          ],
          [
            48,
            652
          ]
        ]
      },
      {
        "id": "e_laptop_mesh",
        "type": "vpn",
        "from": "laptop",
        "to": "mesh",
        "pts": [
          [
            232,
            174
          ],
          [
            290,
            174
          ]
        ]
      },
      {
        "id": "e_vps_mesh",
        "type": "vpn",
        "from": "vps",
        "to": "mesh",
        "both": true,
        "pts": [
          [
            365,
            102
          ],
          [
            365,
            146
          ]
        ],
        "label": [
          404,
          124
        ]
      },
      {
        "id": "e_mesh_node",
        "type": "vpn",
        "from": "mesh",
        "to": "meshnode",
        "pts": [
          [
            365,
            202
          ],
          [
            365,
            395
          ]
        ],
        "label": [
          365,
          334
        ]
      },
      {
        "id": "e_node_lan",
        "type": "lan",
        "from": "meshnode",
        "to": "lan",
        "pts": [
          [
            245,
            440
          ],
          [
            235,
            440
          ],
          [
            235,
            652
          ]
        ]
      },
      {
        "id": "e_ddns_dns",
        "type": "dns",
        "from": "ddns",
        "to": "dns",
        "pts": [
          [
            740,
            395
          ],
          [
            740,
            102
          ]
        ],
        "label": [
          740,
          334
        ]
      },
      {
        "id": "e_proxy_ca",
        "type": "web",
        "from": "proxy",
        "to": "ca",
        "pts": [
          [
            545,
            395
          ],
          [
            545,
            102
          ]
        ],
        "label": [
          545,
          172
        ]
      },
      {
        "id": "e_proxy_dns",
        "type": "dns",
        "from": "proxy",
        "to": "dns",
        "pts": [
          [
            580,
            395
          ],
          [
            580,
            224
          ],
          [
            690,
            224
          ],
          [
            690,
            102
          ]
        ],
        "label": [
          690,
          172
        ]
      },
      {
        "id": "e_ca_dns",
        "type": "dns",
        "from": "ca",
        "to": "dns",
        "both": true,
        "pts": [
          [
            628,
            74
          ],
          [
            670,
            74
          ]
        ],
        "label": [
          649,
          74
        ]
      },
      {
        "id": "e_proxy_idp",
        "type": "web",
        "from": "proxy",
        "to": "idp",
        "pts": [
          [
            512,
            455
          ],
          [
            512,
            495
          ]
        ]
      },
      {
        "id": "e_nas_offsite",
        "type": "backup",
        "from": "nas",
        "to": "offsite",
        "pts": [
          [
            1285,
            346
          ],
          [
            1285,
            202
          ]
        ],
        "label": [
          1285,
          300
        ]
      },
      {
        "id": "e_shares_snaps",
        "type": "backup",
        "from": "shares",
        "to": "snaps",
        "pts": [
          [
            995,
            525
          ],
          [
            1015,
            525
          ]
        ]
      },
      {
        "id": "e_nas_replica",
        "type": "backup",
        "from": "nas",
        "to": "replica",
        "state": "planned",
        "pts": [
          [
            1280,
            608
          ],
          [
            1280,
            680
          ]
        ],
        "label": [
          1280,
          644
        ]
      },
      {
        "id": "e_lan_shares",
        "type": "lan",
        "from": "lan",
        "to": "shares",
        "pts": [
          [
            915,
            652
          ],
          [
            915,
            555
          ]
        ],
        "label": [
          915,
          628
        ]
      },
      {
        "id": "e_lan_smart",
        "type": "lan",
        "from": "lan",
        "to": "smart",
        "pts": [
          [
            142,
            652
          ],
          [
            142,
            555
          ]
        ]
      },
      {
        "id": "e_host_cloud",
        "type": "web",
        "from": "hyp",
        "to": "cloud",
        "pts": [
          [
            802,
            525
          ],
          [
            780,
            525
          ]
        ]
      },
      {
        "id": "e_host_photos",
        "type": "web",
        "from": "nas",
        "to": "photos",
        "pts": [
          [
            1210,
            425
          ],
          [
            1175,
            425
          ]
        ]
      }
    ],
    "services": [
      {
        "id": "vpn",
        "icon": "key",
        "tone": "vpn",
        "routes": [
          {
            "id": "main",
            "state": "active",
            "legs": [
              [
                "e_away_dns",
                "-e_away_dns"
              ],
              [
                "e_away_vpn",
                "e_vpn_lan"
              ]
            ]
          }
        ],
        "needs": [
          {
            "node": "ddns",
            "edges": [
              "e_ddns_dns"
            ],
            "rel": "ddnsHome"
          },
          {
            "node": "dns",
            "rel": "lookup"
          }
        ]
      },
      {
        "id": "mesh",
        "icon": "mesh",
        "tone": "vpn",
        "routes": [
          {
            "id": "main",
            "state": "active",
            "legs": [
              [
                "e_laptop_mesh",
                "e_mesh_node",
                "e_node_lan"
              ]
            ]
          }
        ],
        "needs": []
      },
      {
        "id": "vps",
        "icon": "vps",
        "tone": "vpn",
        "routes": [
          {
            "id": "fromLaptop",
            "state": "active",
            "legs": [
              [
                "e_laptop_mesh",
                "-e_vps_mesh"
              ]
            ]
          },
          {
            "id": "toHome",
            "state": "active",
            "legs": [
              [
                "e_vps_mesh",
                "e_mesh_node",
                "e_node_lan"
              ]
            ]
          }
        ],
        "needs": []
      },
      {
        "id": "cloud",
        "icon": "cloud",
        "tone": "web",
        "routes": [
          {
            "id": "main",
            "state": "active",
            "legs": [
              [
                "e_host_cloud"
              ]
            ]
          }
        ],
        "needs": [
          {
            "node": "idp",
            "rel": "login"
          }
        ]
      },
      {
        "id": "photos",
        "icon": "photo",
        "tone": "web",
        "routes": [
          {
            "id": "main",
            "state": "active",
            "legs": [
              [
                "e_host_photos"
              ]
            ]
          }
        ],
        "needs": []
      },
      {
        "id": "shares",
        "icon": "folder",
        "tone": "lan",
        "routes": [
          {
            "id": "viaVpn",
            "state": "active",
            "legs": [
              [
                "e_away_vpn",
                "e_vpn_lan",
                "e_lan_shares"
              ]
            ],
            "needs": [
              {
                "node": "ddns",
                "edges": [
                  "e_ddns_dns"
                ],
                "rel": "ddnsHome"
              },
              {
                "node": "dns",
                "rel": "lookup"
              }
            ]
          },
          {
            "id": "viaMesh",
            "state": "active",
            "legs": [
              [
                "e_laptop_mesh",
                "e_mesh_node",
                "e_node_lan",
                "e_lan_shares"
              ]
            ]
          }
        ]
      },
      {
        "id": "smart",
        "icon": "home",
        "tone": "lan",
        "routes": [
          {
            "id": "viaVpn",
            "state": "active",
            "legs": [
              [
                "e_away_vpn",
                "e_vpn_lan",
                "e_lan_smart"
              ]
            ],
            "needs": [
              {
                "node": "ddns",
                "edges": [
                  "e_ddns_dns"
                ],
                "rel": "ddnsHome"
              },
              {
                "node": "dns",
                "rel": "lookup"
              }
            ]
          },
          {
            "id": "viaMesh",
            "state": "active",
            "legs": [
              [
                "e_laptop_mesh",
                "e_mesh_node",
                "e_node_lan",
                "e_lan_smart"
              ]
            ]
          }
        ]
      },
      {
        "id": "backup",
        "icon": "backup",
        "tone": "backup",
        "all": true,
        "routes": [
          {
            "id": "offsite",
            "state": "active",
            "legs": [
              [
                "e_nas_offsite"
              ]
            ]
          },
          {
            "id": "snaps",
            "state": "active",
            "legs": [
              [
                "e_shares_snaps"
              ]
            ]
          },
          {
            "id": "replica",
            "state": "planned",
            "legs": [
              [
                "e_nas_replica"
              ]
            ]
          }
        ]
      },
      {
        "id": "certs",
        "icon": "shield",
        "tone": "dns",
        "routes": [
          {
            "id": "main",
            "state": "active",
            "legs": [
              [
                "e_proxy_ca"
              ],
              [
                "e_proxy_dns"
              ],
              [
                "e_ca_dns",
                "-e_ca_dns"
              ],
              [
                "-e_proxy_ca"
              ]
            ]
          }
        ],
        "needs": []
      },
      {
        "id": "ddns",
        "icon": "refresh",
        "tone": "dns",
        "routes": [
          {
            "id": "main",
            "state": "active",
            "legs": [
              [
                "e_ddns_dns"
              ]
            ]
          }
        ],
        "needs": []
      }
    ],
    "text": {
      "states": {
        "active": "In use",
        "ondemand": "On demand",
        "planned": "Planned"
      },
      "statesShort": {
        "active": "in use",
        "ondemand": "on demand",
        "planned": "planned"
      },
      "types": {
        "vpn": "VPN relationship",
        "web": "Application relationship",
        "lan": "Home network",
        "dns": "Name services",
        "backup": "Backup"
      },
      "zones": {
        "cloud": "Clients · cloud services",
        "home": "Home"
      },
      "nodes": {
        "away": [
          "Client devices",
          "",
          "Devices that use the homelab services."
        ],
        "phone": [
          "Phone",
          "client device",
          "A mobile client."
        ],
        "laptop": [
          "Laptop",
          "client device",
          "A portable client."
        ],
        "vps": [
          "Cloud VPS",
          "virtual server",
          "A small cloud server connected with mesh VPN tools."
        ],
        "mesh": [
          "Mesh VPN",
          "encrypted network",
          "A mesh VPN connects participating devices."
        ],
        "ca": [
          "Certificate authority",
          "certificates",
          "A certificate authority supports HTTPS certificate management."
        ],
        "dns": [
          "DNS",
          "name services",
          "Name services used by the system."
        ],
        "offsite": [
          "Off-site storage",
          "encrypted copy",
          "A separate destination for an encrypted backup copy.",
          "Off-site copy"
        ],
        "router": [
          "ISP router",
          "network gateway",
          "The gateway for the home network."
        ],
        "lan": [
          "Home network",
          "",
          "The home network that connects the machines."
        ],
        "hyp": [
          "Hypervisor",
          "compute",
          "Hosts application workloads."
        ],
        "vpngw": [
          "VPN gateway",
          "encrypted access",
          "Provides VPN connectivity."
        ],
        "meshnode": [
          "Mesh VPN node",
          "encrypted access",
          "Participates in the mesh VPN."
        ],
        "proxy": [
          "Reverse proxy",
          "application routing",
          "Routes application requests."
        ],
        "ddns": [
          "Dynamic DNS updater",
          "name updates",
          "Keeps address information current.",
          "Dynamic DNS"
        ],
        "idp": [
          "Identity provider (passkeys)",
          "sign-in",
          "Provides passkey sign-in for self-hosted cloud storage.",
          "Identity provider"
        ],
        "cloud": [
          "Self-hosted cloud storage",
          "file sync and sharing",
          "Self-hosted file sync and sharing, with sign-in delegated to the identity provider.",
          "Cloud storage"
        ],
        "smart": [
          "Smart home",
          "home automation",
          "Home automation hosted on the hypervisor."
        ],
        "nas": [
          "NAS",
          "storage",
          "Hosts shared data, snapshots and the photo library."
        ],
        "photos": [
          "Photo library",
          "photo management",
          "A self-hosted photo library."
        ],
        "shares": [
          "File shares",
          "shared folders",
          "Shared folders managed by the NAS."
        ],
        "snaps": [
          "Snapshots",
          "point-in-time copies",
          "Regular ZFS snapshots of the shared data, kept on the same pool for quick restores."
        ],
        "replica": [
          "Local replica",
          "second NAS",
          "A second NAS for local ZFS replication."
        ]
      },
      "edges": {
        "e_away_dns": [
          "DNS",
          "Client devices use name services."
        ],
        "e_away_vpn": [
          "VPN",
          "The role of a VPN gateway in encrypted access."
        ],
        "e_vpn_lan": [
          "",
          "The VPN gateway provides network connectivity."
        ],
        "e_laptop_mesh": [
          "",
          "A client participates in the mesh."
        ],
        "e_vps_mesh": [
          "mesh",
          "A cloud server participates in the mesh."
        ],
        "e_mesh_node": [
          "mesh",
          "The mesh includes a home node."
        ],
        "e_node_lan": [
          "",
          "The home node provides network connectivity."
        ],
        "e_ddns_dns": [
          "updates",
          "Dynamic DNS maintains address information."
        ],
        "e_proxy_ca": [
          "certificates",
          "The reverse proxy uses certificates."
        ],
        "e_proxy_dns": [
          "DNS",
          "Name services support certificate management."
        ],
        "e_ca_dns": [
          "validation",
          "Name validation supports certificate management."
        ],
        "e_proxy_idp": [
          "",
          "Application routing supports the identity provider."
        ],
        "e_nas_offsite": [
          "encrypted",
          "An encrypted backup copy is kept off-site."
        ],
        "e_shares_snaps": [
          "",
          "Snapshots of shared data."
        ],
        "e_nas_replica": [
          "replica",
          "Local ZFS replication between storage systems."
        ],
        "e_lan_shares": [
          "files",
          "Shared folders on the NAS."
        ],
        "e_lan_smart": [
          "",
          "Home automation."
        ],
        "e_host_cloud": [
          "",
          "The hypervisor hosts cloud storage."
        ],
        "e_host_photos": [
          "",
          "The NAS hosts the photo library."
        ]
      },
      "needs": {
        "ddnsHome": "address updates",
        "lookup": "name services",
        "login": "passkey sign-in",
        "loginPage": "application routing",
        "publicAddr": "network connectivity"
      },
      "services": {
        "vpn": {
          "chip": "Home via VPN",
          "name": "Explore VPN connectivity",
          "desc": "Follow the roles involved in VPN connectivity.",
          "routes": {
            "main": "Device → VPN gateway"
          }
        },
        "mesh": {
          "chip": "Home via mesh VPN",
          "name": "Explore mesh VPN connectivity",
          "desc": "Follow the roles involved in mesh VPN connectivity.",
          "routes": {
            "main": "Laptop → mesh → home"
          }
        },
        "vps": {
          "chip": "Cloud VPS",
          "name": "Explore the cloud VPS",
          "desc": "A cloud server participates in the mesh. Select a variant to explore the related roles.",
          "routes": {
            "fromLaptop": "Laptop → VPS",
            "toHome": "VPS → home"
          }
        },
        "cloud": {
          "chip": "Cloud storage",
          "name": "Open the self-hosted cloud storage",
          "desc": "Cloud storage runs on the hypervisor and depends on the identity provider for passkey sign-in.",
          "routes": {
            "main": "Hypervisor → cloud storage"
          }
        },
        "photos": {
          "chip": "Photo library",
          "name": "Browse the photo library",
          "desc": "The photo library runs on the NAS. This view shows the hosting relationship.",
          "routes": {
            "main": "NAS → photo library"
          }
        },
        "shares": {
          "chip": "File shares",
          "name": "Open the shared folders",
          "desc": "Shared folders are managed by the NAS. Select a VPN relationship to explore the related components.",
          "routes": {
            "viaVpn": "VPN relationship",
            "viaMesh": "Mesh VPN relationship"
          }
        },
        "smart": {
          "chip": "Smart home",
          "name": "Open the smart home dashboard",
          "desc": "Home automation runs on the hypervisor. Select a VPN relationship to explore the related components.",
          "routes": {
            "viaVpn": "VPN relationship",
            "viaMesh": "Mesh VPN relationship"
          }
        },
        "backup": {
          "chip": "Backups",
          "name": "Where the copies go",
          "desc": "Explore snapshots, an encrypted off-site copy and local replication.",
          "routes": {
            "offsite": "Off-site, encrypted",
            "snaps": "Snapshots",
            "replica": "Local replica"
          }
        },
        "certs": {
          "chip": "HTTPS certificates",
          "name": "Explore certificate management",
          "desc": "Certificate management involves the reverse proxy, a certificate authority and name services.",
          "routes": {
            "main": "Reverse proxy ↔ certificate authority"
          }
        },
        "ddns": {
          "chip": "Dynamic DNS",
          "name": "Explore dynamic DNS",
          "desc": "The updater keeps DNS address information current.",
          "routes": {
            "main": "Updater → DNS"
          }
        }
      }
    }
  }
};

/* ===================================================================== */
/*  Rendering. No copy below this line: everything comes from DATA.      */
/* ===================================================================== */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var doc = document, root = doc.documentElement;
  var M = DATA.map, V = M.view, BUS = M.bus, U = DATA.ui, TX = M.text, P = DATA.page;

  function mq(q) { return window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener: function () {} }; }
  function onMq(m, fn) { if (m.addEventListener) m.addEventListener("change", fn); else if (m.addListener) m.addListener(fn); }
  var mqRM = mq("(prefers-reduced-motion: reduce)");
  var mqNarrow = mq("(max-width: 720px)");
  var mqCoarse = mq("(hover: none)");
  var RM = mqRM.matches;
  var keyboardAction = false;
  doc.addEventListener("keydown", function () { keyboardAction = true; root.classList.add("keyboard-input"); }, true);
  doc.addEventListener("pointerdown", function () { keyboardAction = false; root.classList.remove("keyboard-input"); }, true);

  var store = {
    get: function (k) { try { return window.localStorage.getItem(DATA.site.storageKey + ":" + k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(DATA.site.storageKey + ":" + k, v); } catch (e) { /* ignored */ } }
  };

  function $(s, r) { return (r || doc).querySelector(s); }
  function setAttrs(e, attrs) {
    if (!attrs) return;
    for (var k in attrs) {
      if (attrs[k] == null) continue;
      if (k === "style") e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
  }
  function el(tag, attrs, parent, text) {
    var e = doc.createElement(tag);
    setAttrs(e, attrs);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function sv(tag, attrs, parent) {
    var e = doc.createElementNS(NS, tag);
    setAttrs(e, attrs);
    if (parent) parent.appendChild(e);
    return e;
  }
  function icon(name, parent, attrs) {
    var s = sv("svg", Object.assign({ "aria-hidden": "true", focusable: "false" }, attrs || {}), parent);
    sv("use", { href: "#i-" + name }, s);
    return s;
  }
  function tv(name) { return "var(--t-" + name + ")"; }
  function stv(state) { return "var(" + M.states[state || "active"] + ")"; }

  /* =================================================================== */
  /*  Page                                                               */
  /* =================================================================== */
  function secHead(box, d, id) {
    box.textContent = "";
    el("p", { "class": "eyebrow" }, box, d.eyebrow);
    el("h2", { id: id }, box, d.title);
    if (d.lede) el("p", { "class": "lede" }, box, d.lede);
  }

  function renderHeader() {
    var skip = $("#skip");
    skip.textContent = P.skip;
    var brand = $("#brand");
    brand.setAttribute("aria-label", P.brandLabel);
    var mark = el("span", { "class": "brand-mark", "aria-hidden": "true" }, brand);
    icon("map", mark);
    var word = el("span", { "class": "brand-word" }, brand);
    el("b", null, word, P.brandMain);
    el("span", null, word, P.brandSub);
    var nav = $("#nav");
    nav.setAttribute("aria-label", P.navLabel);
    var ul = el("ul", null, nav);
    P.nav.forEach(function (n) {
      var li = el("li", null, ul);
      el("a", { href: n.href }, li, n.label);
    });
  }

  function renderHero() {
    var H = P.hero, box = $("#hero-copy");
    el("p", { "class": "eyebrow" }, box, H.eyebrow);
    var h1 = el("h1", { id: "hero-title" }, box);
    H.title.forEach(function (part) {
      if (part.br) el("br", { "class": "br-wide" }, h1);
      el("span", { "class": part.accent ? "accent" : null }, h1, part.text);
    });
    el("p", { "class": "hero-lede" }, box, H.lede);
    var cta = el("div", { "class": "cta" }, box);
    var a1 = el("a", { "class": "btn btn-primary", href: H.ctaPrimary.href }, cta);
    el("span", null, a1, H.ctaPrimary.label);
    icon("down", a1);
    el("a", { "class": "btn btn-ghost", href: H.ctaSecondary.href }, cta, H.ctaSecondary.label);

    var O = H.orbit, art = $("#orbit");
    art.setAttribute("aria-label", O.label);
    el("div", { "class": "orb-glow", "aria-hidden": "true" }, art);
    var rings = [{ items: O.outer, cls: "ring-outer" }, { items: O.inner, cls: "ring-inner" }];
    rings.forEach(function (r) {
      var ring = el("div", { "class": "ring " + r.cls, "aria-hidden": "true" }, art);
      el("span", { "class": "ring-line" }, ring);
      el("span", { "class": "ring-packet" }, ring);
      r.items.forEach(function (it, i) {
        var a = (360 / r.items.length) * i - 90;
        var slot = el("span", { "class": "orb-slot", style: "--a:" + a + "deg" }, ring);
        var chip = el("span", { "class": "orb-chip", style: "--c:" + tv(it.tone) }, slot);
        var ic = el("span", { "class": "orb-ic" }, chip);
        icon(it.icon, ic);
        el("span", { "class": "orb-lb" }, chip, it.label);
      });
    });
    var core = el("div", { "class": "orb-core", "aria-hidden": "true" }, art);
    icon(O.center.icon, core);
    el("span", null, core, O.center.label);
    var list = el("ul", { "class": "vh" }, art);
    O.inner.concat(O.outer).forEach(function (it) { el("li", null, list, it.label); });
  }

  function renderPrinciples() {
    var D = P.principles;
    secHead($("#principles-head"), D, "principles-h");
    var ol = $("#principles-list");
    D.items.forEach(function (it, i) {
      var li = el("li", { "class": "pcard reveal", style: "--i:" + i }, ol);
      var top = el("div", { "class": "pcard-top" }, li);
      var ic = el("span", { "class": "pcard-ic" }, top);
      icon(it.icon, ic);
      el("span", { "class": "pcard-n", "aria-hidden": "true" }, top, String(i + 1).padStart(2, "0"));
      el("h3", null, li, it.title);
      el("p", null, li, it.text);
    });
  }

  function renderStack() {
    var D = P.stack;
    secHead($("#stack-head"), D, "stack-h");
    var grid = $("#stack-grid");
    D.groups.forEach(function (g, i) {
      var card = el("section", { "class": "scard reveal", style: "--i:" + i + ";--c:" + tv(g.tone), "aria-labelledby": "stack-g" + i }, grid);
      var h = el("div", { "class": "scard-h" }, card);
      var ic = el("span", { "class": "scard-ic" }, h);
      icon(g.icon, ic);
      el("h3", { id: "stack-g" + i }, h, g.title);
      var dl = el("dl", null, card);
      g.items.forEach(function (it) {
        var row = el("div", null, dl);
        el("dt", null, row, it[0]);
        el("dd", null, row, it[1]);
      });
    });
  }

  function renderFooter() {
    var f = $("#foot");
    var line = el("p", { "class": "foot-main" }, f);
    el("span", null, line, P.footer.copyright.replace("{year}", new Date().getFullYear()));
    el("a", { href: "https://" + DATA.site.home + "/" }, line, P.footer.owner);
    el("p", { "class": "foot-note" }, f, P.footer.note);
  }

  /* Header state is shared by restored scroll positions and user scrolling. */
  function setupHeaderScroll() {
    var header = $(".site-header"), scheduled = false;
    function syncHeader() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      scheduled = false;
    }
    function scheduleHeader() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(syncHeader);
    }
    window.addEventListener("scroll", scheduleHeader, { passive: true });
    window.addEventListener("pageshow", scheduleHeader);
    syncHeader();
  }

  /* ---------- theme ---------- */
  function effectiveTheme() {
    var a = root.getAttribute("data-theme");
    if (a) return a;
    return mq("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function renderTheme() {
    var th = effectiveTheme(), bt = $("#btn-theme");
    bt.textContent = "";
    icon(th === "dark" ? "sun" : "moon", bt);
    var lbl = th === "dark" ? P.themeToLight : P.themeToDark;
    bt.setAttribute("aria-label", lbl);
    bt.setAttribute("title", lbl);
  }
  $("#btn-theme").addEventListener("click", function () {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store.set("theme", next);
    renderTheme();
  });
  onMq(mq("(prefers-color-scheme: light)"), renderTheme);

  /* ---------- reveal on scroll ---------- */
  function setupReveal() {
    var items = doc.querySelectorAll(".reveal");
    if (RM || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (n) { n.classList.add("in"); });
      return;
    }
    root.classList.add("reveal-on");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(items, function (n) { io.observe(n); });
  }

  /* hero animation only while visible */
  function setupHeroPause() {
    var art = $("#orbit");
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (en) {
      art.classList.toggle("offscreen", !en[0].isIntersecting);
    }).observe(art);
  }

  /* =================================================================== */
  /*  Map                                                                */
  /* =================================================================== */
  var S = { svc: null, route: 0, node: null, paused: false, vb: [0, 0, V.w, V.h], fitted: false };

  function nm(id) { var n = TX.nodes[id]; return n ? n[0] : id; }
  function nsub(id) { var n = TX.nodes[id]; return n ? n[1] : ""; }
  function nshort(id) { var n = TX.nodes[id]; return n ? (n[3] || n[0]) : id; }
  function nrole(id) { var n = TX.nodes[id]; return n ? n[2] : ""; }

  /* indexes */
  var N = {}, E = {}, SV = {}, CH = {}, OUTSIDE = {}, HOSTS = {};
  M.groups.forEach(function (g) { N[g.id] = Object.assign({ kind: "group", state: "active" }, g); CH[g.id] = []; if (g.host) HOSTS[g.id] = true; });
  N[M.router.id] = Object.assign({ kind: "router", state: "active" }, M.router);
  N[BUS.id] = { id: BUS.id, kind: "lan", state: "active", x: BUS.x1, y: BUS.y - 8, w: BUS.x2 - BUS.x1, h: 16, tone: BUS.tone };
  M.nodes.forEach(function (n) { N[n.id] = Object.assign({ kind: "node" }, n); if (n.parent) CH[n.parent].push(n.id); });
  M.edges.forEach(function (e) { E[e.id] = Object.assign({ state: "active" }, e); });
  M.services.forEach(function (s) { SV[s.id] = s; });
  Object.keys(N).forEach(function (id) {
    var n = N[id];
    if (n.kind === "router" || n.kind === "lan") return;
    OUTSIDE[id] = n.y + n.h <= M.zones[1].y;
  });

  /* geometry */
  function pathD(pts, r) {
    r = r == null ? 10 : r;
    var d = "M" + pts[0][0] + " " + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i];
      if (i < pts.length - 1) {
        var a = pts[i - 1], b = pts[i + 1];
        var l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
        var rr = Math.min(r, l1 / 2, l2 / 2);
        if (rr < 1) { d += " L" + p[0] + " " + p[1]; continue; }
        var p1 = [p[0] - (p[0] - a[0]) / l1 * rr, p[1] - (p[1] - a[1]) / l1 * rr];
        var p2 = [p[0] + (b[0] - p[0]) / l2 * rr, p[1] + (b[1] - p[1]) / l2 * rr];
        d += " L" + p1[0] + " " + p1[1] + " Q" + p[0] + " " + p[1] + " " + p2[0] + " " + p2[1];
      } else d += " L" + p[0] + " " + p[1];
    }
    return d;
  }

  /* expand a route into drawable segments plus the nodes it crosses */
  function expandRoute(route) {
    var legs = [], nodes = [], edges = {}, seen = {};
    function addNode(id) { if (!seen[id]) { seen[id] = true; nodes.push(id); } }
    route.legs.forEach(function (leg) {
      var segs = [], prev = null;
      leg.forEach(function (hop) {
        var rev = hop.charAt(0) === "-", id = rev ? hop.slice(1) : hop, e = E[id];
        var pts = e.pts.map(function (p) { return p.slice(); });
        if (rev) pts.reverse();
        var from = rev ? e.to : e.from, to = rev ? e.from : e.to;
        if (prev && prev.to === BUS.id && from === BUS.id) {
          var a = prev.pts[prev.pts.length - 1], b = pts[0];
          if (a[0] !== b[0]) segs.push({ pts: [[a[0], BUS.y], [b[0], BUS.y]], type: "lan", state: "active", bus: true, from: BUS.id, to: BUS.id });
        }
        addNode(from);
        if (e.type === "vpn" && OUTSIDE[from] !== undefined && OUTSIDE[to] !== undefined && OUTSIDE[from] !== OUTSIDE[to]) addNode(M.router.id);
        addNode(to);
        edges[id] = true;
        var seg = { pts: pts, type: e.type, state: e.state, id: id, from: from, to: to };
        segs.push(seg);
        prev = seg;
      });
      legs.push(segs);
    });
    return { legs: legs, nodes: nodes, edges: edges };
  }

  function routeNeeds(svc, route) {
    var list = (svc.needs || []).concat(route.needs || []), out = [], seen = {};
    list.forEach(function (n) { if (!seen[n.node]) { seen[n.node] = true; out.push(n); } });
    expandRoute(route).nodes.forEach(function (id) {
      var p = N[id] && N[id].parent;
      if (p && HOSTS[p] && expandRoute(route).nodes.indexOf(p) < 0 && !seen[p]) { seen[p] = true; out.push({ node: p, rel: null, host: true }); }
    });
    return out;
  }

  function impactOf(id) {
    var ids = [id].concat(CH[id] || []), res = [];
    M.services.forEach(function (s) {
      var hit = [];
      s.routes.forEach(function (r) {
        var set = {};
        expandRoute(r).nodes.forEach(function (n) { set[n] = true; });
        routeNeeds(s, r).forEach(function (n) { set[n.node] = true; });
        if (ids.some(function (i) { return set[i]; })) hit.push(r.id);
      });
      if (hit.length) res.push({ svc: s.id, routes: hit, all: hit.length === s.routes.length });
    });
    return res;
  }

  function fitText(t, maxW, minSize) {
    var size = parseFloat(t.getAttribute("font-size")) || 13;
    var full = t.textContent;
    try {
      while (t.getComputedTextLength() > maxW && size > minSize) { size -= 0.5; t.setAttribute("font-size", size); }
      if (t.getComputedTextLength() > maxW) {
        var s = full;
        while (s.length > 3 && t.getComputedTextLength() > maxW) { s = s.slice(0, -1); t.textContent = s.replace(/\s+$/, "") + U.ellipsis; }
      }
    } catch (e) { /* not rendered yet */ }
  }

  /* ---------- build ---------- */
  var svg = $("#map-svg"), L = {}, nodeEl = {}, edgeEl = {}, labelEl = {}, busEl = null;
  var usedStates = {};
  M.nodes.forEach(function (n) { usedStates[n.state] = true; });
  M.edges.forEach(function (e) { usedStates[e.state || "active"] = true; });

  function build(intro) {
    svg.textContent = "";
    svg.setAttribute("viewBox", S.vb.join(" "));
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("aria-labelledby", "map-title map-desc");
    sv("title", { id: "map-title" }, svg).textContent = U.mapTitle;
    sv("desc", { id: "map-desc" }, svg).textContent = U.mapDesc;

    var defs = sv("defs", null, svg);
    var gr = sv("linearGradient", { id: "gRouter", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    sv("stop", { offset: "0", style: "stop-color:var(--router-a)" }, gr);
    sv("stop", { offset: "0.5", style: "stop-color:var(--router-b)" }, gr);
    sv("stop", { offset: "1", style: "stop-color:var(--router-a)" }, gr);
    M.edgeTypes.forEach(function (t) {
      var m = sv("marker", { id: "m-" + t, viewBox: "0 0 10 10", refX: "8.5", refY: "5", markerWidth: "9", markerHeight: "9", markerUnits: "userSpaceOnUse", orient: "auto-start-reverse" }, defs);
      sv("path", { d: "M1 1.2 L9 5 L1 8.8 L3 5 Z", style: "fill:" + tv(t) }, m);
    });

    ["zones", "groups", "bus", "edges", "router", "dep", "trace", "labels", "nodes", "packets", "tags"].forEach(function (k) {
      L[k] = sv("g", { "class": "l-" + k }, svg);
    });
    ["edges", "dep", "trace", "labels", "tags", "packets"].forEach(function (k) { L[k].setAttribute("aria-hidden", "true"); });
    nodeEl = {}; edgeEl = {}; labelEl = {};

    M.zones.forEach(function (z, i) {
      var g = sv("g", { "class": "zone z-" + z.id, style: "--d:" + (i * 90) + "ms", "aria-hidden": "true" }, L.zones);
      sv("rect", { x: z.x, y: z.y, width: z.w, height: z.h, rx: 26 }, g);
      sv("text", { "class": "zlabel", x: z.label[0], y: z.label[1], "text-anchor": z.label[2] }, g).textContent = TX.zones[z.id];
    });

    M.groups.forEach(function (gd, i) {
      var g = sv("g", { "class": "grp " + gd.cls, "data-id": gd.id, tabindex: "0", role: "button", style: "--d:" + (180 + i * 70) + "ms;--nc:" + tv(gd.tone) }, L.groups);
      sv("rect", { "class": "box", x: gd.x, y: gd.y, width: gd.w, height: gd.h, rx: gd.cls === "g-out" ? 26 : 20 }, g);
      if (gd.label) sv("text", { "class": gd.cls === "g-out" ? "zlabel" : "glabel", x: gd.label[0], y: gd.label[1], "text-anchor": gd.label[2] }, g).textContent = nm(gd.id);
      if (gd.sub && nsub(gd.id)) sv("text", { "class": "gsub", x: gd.sub[0], y: gd.sub[1], "text-anchor": gd.sub[2] }, g).textContent = nsub(gd.id);
      g.setAttribute("aria-label", nm(gd.id) + (nsub(gd.id) ? ": " + nsub(gd.id) : ""));
      nodeEl[gd.id] = g;
    });

    busEl = sv("g", { "class": "bus", "data-id": BUS.id, tabindex: "0", role: "button", style: "--d:700ms", "aria-label": nm(BUS.id) }, L.bus);
    sv("line", { "class": "line", x1: BUS.x1, y1: BUS.y, x2: BUS.x2, y2: BUS.y }, busEl);
    sv("line", { "class": "hit", x1: BUS.x1, y1: BUS.y, x2: BUS.x2, y2: BUS.y }, busEl);
    nodeEl[BUS.id] = busEl;

    M.edges.forEach(function (ed, i) {
      var e = E[ed.id];
      var g = sv("g", { "class": "edge t-" + e.type + " s-" + e.state, "data-edge": e.id, style: "--d:" + (980 + i * 26) + "ms" }, L.edges);
      var d = pathD(e.pts);
      sv("path", { "class": "hit", d: d }, g);
      var mk = "url(#m-" + e.type + ")";
      sv("path", { "class": "base", d: d, "marker-end": e.to === BUS.id ? null : mk, "marker-start": e.both ? mk : null }, g);
      if (e.state === "active") sv("path", { "class": "amb", d: d }, g);
      if (intro && !RM) sv("path", { "class": "draw", d: d, pathLength: "1", style: "--d:" + (980 + i * 26) + "ms" }, g);
      edgeEl[e.id] = g;
      var txt = TX.edges[e.id] && TX.edges[e.id][0];
      if (e.label && txt) {
        var w = Math.max(28, txt.length * 6.4 + 14);
        var lg = sv("g", { "class": "elabel t-" + e.type, style: "--d:" + (1500 + i * 20) + "ms" }, L.labels);
        sv("rect", { x: e.label[0] - w / 2, y: e.label[1] - 9, width: w, height: 18, rx: 9 }, lg);
        sv("text", { x: e.label[0], y: e.label[1] + 3.8, "text-anchor": "middle" }, lg).textContent = txt;
        labelEl[e.id] = lg;
      }
    });

    var R = M.router;
    var rg = sv("g", { "class": "router", "data-id": R.id, tabindex: "0", role: "button", style: "--d:300ms;--nc:" + tv(R.tone) }, L.router);
    sv("rect", { "class": "bar", x: R.x, y: R.y, width: R.w, height: R.h, rx: 16 }, rg);
    icon(R.icon, rg, { x: R.label[0] - 150, y: R.y + 13, width: 24, height: 24, "class": "router-ic" });
    sv("text", { "class": "rname", x: R.label[0] - 118, y: R.label[1] + 1 }, rg).textContent = nm(R.id);
    sv("text", { "class": "rsub", x: R.label[0] - 118, y: R.sub[1] + 2 }, rg).textContent = nsub(R.id);
    rg.setAttribute("aria-label", nm(R.id) + ": " + nsub(R.id));
    nodeEl[R.id] = rg;

    var bl = nm(BUS.id), bw = bl.length * 6.6 + 18;
    var blg = sv("g", { "class": "elabel t-lan", style: "--d:1500ms" }, L.labels);
    sv("rect", { x: BUS.label[0] - bw / 2, y: BUS.label[1] - 10, width: bw, height: 20, rx: 10 }, blg);
    sv("text", { x: BUS.label[0], y: BUS.label[1] + 4, "text-anchor": "middle" }, blg).textContent = bl;
    labelEl[BUS.id] = blg;

    var order = M.nodes.slice().sort(function (a, b) { return (a.y - b.y) || (a.x - b.x); });
    order.forEach(function (n, i) {
      var g = sv("g", {
        "class": "node s-" + n.state, "data-id": n.id, tabindex: "0", role: "button",
        style: "--d:" + (420 + i * 26) + "ms;--nc:" + tv(n.tone) + ";--sc:" + stv(n.state),
        "aria-label": U.nodeAria.replace("{name}", nm(n.id)).replace("{sub}", nsub(n.id) + (n.state !== "active" ? ", " + TX.statesShort[n.state] : ""))
      }, L.nodes);
      var lift = sv("g", { "class": "lift" }, g);
      sv("rect", { "class": "halo", x: n.x - 5, y: n.y - 5, width: n.w + 10, height: n.h + 10, rx: 18 }, lift);
      sv("rect", { "class": "card", x: n.x, y: n.y, width: n.w, height: n.h, rx: 14 }, lift);
      var ib = 30, iy = n.y + (n.h - ib) / 2;
      sv("rect", { "class": "icbg", x: n.x + 9, y: iy, width: ib, height: ib, rx: 10 }, lift);
      icon(n.icon, lift, { "class": "ic", x: n.x + 15, y: iy + 6, width: 18, height: 18 });
      var t1 = sv("text", { "class": "nm", x: n.x + 47, y: n.y + n.h / 2 - 2, "font-size": "13.5" }, lift);
      t1.textContent = nshort(n.id);
      var t2 = sv("text", { "class": "sb", x: n.x + 47, y: n.y + n.h / 2 + 14, "font-size": "11" }, lift);
      t2.textContent = nsub(n.id);
      sv("circle", { "class": "stp", cx: n.x + n.w - 11, cy: n.y + 11, r: 4 }, lift);
      sv("circle", { "class": "st", cx: n.x + n.w - 11, cy: n.y + 11, r: 4 }, lift);
      nodeEl[n.id] = g;
      g._fit = [t1, n.w - 47 - 9, t2, n.w - 47 - 8];
    });
    Object.keys(nodeEl).forEach(function (id) {
      var f = nodeEl[id]._fit;
      if (f) { fitText(f[0], f[1], 10); fitText(f[2], f[3], 9.5); }
    });

    svg.classList.remove("pre");
    svg.classList.toggle("intro", !!intro && !RM);
    if (intro && !RM) setTimeout(function () {
      svg.classList.remove("intro");
      Array.prototype.forEach.call(svg.querySelectorAll(".draw"), function (d) { d.remove(); });
    }, 2900);
  }

  /* ---------- selection ---------- */
  var tracks = [];
  function currentRoutes() {
    if (!S.svc) return [];
    var s = SV[S.svc];
    if (S.route === "all") return s.routes.slice();
    return [s.routes[S.route] || s.routes[0]];
  }
  function arrowAt(pts, parent, color, delay) {
    var a = pts[pts.length - 2], b = pts[pts.length - 1];
    var ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    var p = sv("path", { d: "M-9 -5.5 L1 0 L-9 5.5 L-6.5 0 Z", transform: "translate(" + b[0] + " " + b[1] + ") rotate(" + ang + ")", style: "fill:" + color }, parent);
    if (!RM && !S.paused && !keyboardAction && p.animate) p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: delay, fill: "both" });
    return p;
  }
  function drawTrace(segs, startDelay) {
    var t = startDelay, built = [];
    segs.forEach(function (sg) {
      var color = tv(sg.type);
      var g = sv("g", { "class": "trace" + (sg.state === "planned" ? " planned" : "") }, L.trace);
      var d = pathD(sg.pts);
      sv("path", { "class": "glow", d: d, style: "stroke:" + color }, g);
      var core = sv("path", { "class": "core", d: d, style: "stroke:" + color }, g);
      var flow = sv("path", { "class": "flow", d: d }, g);
      var len = core.getTotalLength();
      var dur = Math.max(260, len / 0.9);
      if (!RM && !S.paused && !keyboardAction && core.animate) {
        if (sg.state === "planned") core.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay: t, fill: "both" });
        else core.animate([{ strokeDasharray: len + " " + len, strokeDashoffset: len }, { strokeDasharray: len + " " + len, strokeDashoffset: 0 }], { duration: dur, delay: t, easing: "cubic-bezier(0.3, 0.7, 0.3, 1)", fill: "backwards" });
        g.firstChild.animate([{ opacity: 0 }, { opacity: 0.16 }], { duration: dur, delay: t, fill: "backwards" });
        flow.animate([{ opacity: 0 }, { opacity: 0.95 }], { duration: 300, delay: t + dur, fill: "backwards" });
      }
      if (!sg.bus) arrowAt(sg.pts, g, color, RM ? 0 : t + dur - 120);
      built.push({ el: core, len: len, color: color, planned: sg.state === "planned" });
      t += dur * 0.85;
    });
    return { segs: built, end: t };
  }
  function depTag(x, y, rel, alignEnd) {
    var g = sv("g", { "class": "dtag" }, L.tags);
    var k = U.depTag, txt = k + (rel ? " · " + rel : "");
    var w = txt.length * 6.2 + 20;
    if (alignEnd) x -= w / 2;
    sv("rect", { x: x - w / 2, y: y - 11, width: w, height: 22, rx: 11 }, g);
    var t = sv("text", { x: x, y: y + 4, "text-anchor": "middle" }, g);
    var a = sv("tspan", { "class": "k" }, t); a.textContent = k;
    if (rel) { var b = sv("tspan", null, t); b.textContent = " · " + rel; }
    if (!RM && !S.paused && !keyboardAction && g.animate) g.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 380, delay: 500, easing: "cubic-bezier(0.22, 0.8, 0.24, 1)", fill: "backwards" });
    return g;
  }
  function ripple(id, bad) {
    var n = N[id];
    if (!n || n.kind === "lan") return;
    sv("rect", { "class": "ripple" + (bad ? " bad" : ""), x: n.x - 4, y: n.y - 4, width: n.w + 8, height: n.h + 8, rx: n.kind === "node" ? 17 : 22 }, L.tags);
  }
  function clearOverlays() {
    ["dep", "trace", "tags", "packets"].forEach(function (k) { L[k].textContent = ""; });
    tracks = [];
    Object.keys(nodeEl).forEach(function (id) { nodeEl[id].classList.remove("on", "dep", "what", "pinned"); });
    Object.keys(edgeEl).forEach(function (id) { edgeEl[id].classList.remove("on", "dep"); });
    Object.keys(labelEl).forEach(function (id) { labelEl[id].classList.remove("on"); });
  }
  function mark(id, cls) {
    if (nodeEl[id]) nodeEl[id].classList.add(cls);
    var p = N[id] && N[id].parent;
    if (cls === "on" && p && !HOSTS[p] && nodeEl[p]) nodeEl[p].classList.add("on");
  }
  function markEdge(id, cls) {
    if (edgeEl[id]) edgeEl[id].classList.add(cls);
    if (cls === "on" && labelEl[id]) labelEl[id].classList.add("on");
  }

  function applyMap() {
    clearOverlays();
    var routes = currentRoutes();
    var sel = routes.length > 0 || !!S.node;
    svg.classList.toggle("svg-sel", sel);
    svg.classList.toggle("svg-idle", !sel);
    if (routes.length) {
      var s = SV[S.svc], delay = 120, usesLan = false;
      routes.forEach(function (r) {
        var x = expandRoute(r);
        x.nodes.forEach(function (id) { mark(id, "on"); if (id === BUS.id) usesLan = true; });
        Object.keys(x.edges).forEach(function (id) { markEdge(id, "on"); });
        var allSegs = [], startDelay = delay;
        x.legs.forEach(function (leg) {
          var tr = drawTrace(leg, delay);
          allSegs = allSegs.concat(tr.segs);
          delay = tr.end + 80;
        });
        tracks.push({ segs: allSegs, total: allSegs.reduce(function (a, b) { return a + b.len; }, 0), offset: startDelay / 1000, planned: r.state === "planned" });
        if (S.route === "all") delay = 120 + tracks.length * 140;
        routeNeeds(s, r).forEach(function (nd) {
          var n = N[nd.node];
          mark(nd.node, "dep");
          (nd.edges || []).forEach(function (eid) {
            markEdge(eid, "dep");
            sv("path", { "class": "dline", d: pathD(E[eid].pts) }, L.dep);
          });
          var rel = nd.host ? U.hostRel : TX.needs[nd.rel];
          var at = nd.at || (n.kind === "group" ? [n.x + n.w - 14, n.y + 24] : (n.y < 140 ? [n.x + n.w / 2, n.y + n.h + 13] : [n.x + n.w / 2, n.y - 13]));
          if (!nd.host) ripple(nd.node, false);
          depTag(at[0], at[1], rel, !nd.at && n.kind === "group");
        });
      });
      busEl.classList.toggle("on", usesLan);
      startPackets();
    } else busEl.classList.remove("on");

    if (S.node) {
      var id = S.node;
      mark(id, "what");
      if (nodeEl[id]) nodeEl[id].classList.add("pinned", "on");
      (CH[id] || []).forEach(function (c) { mark(c, "on"); });
      M.edges.forEach(function (e) {
        var ends = [e.from, e.to];
        var touch = ends.indexOf(id) >= 0 || (CH[id] || []).some(function (c) { return ends.indexOf(c) >= 0; });
        if (touch) { markEdge(e.id, "on"); mark(e.from, "on"); mark(e.to, "on"); }
      });
      if (id === BUS.id) busEl.classList.add("on");
      ripple(id, true);
    }
  }

  /* ---------- animated packets ---------- */
  var raf = 0, t0 = 0, tPause = 0, mapVisible = true;
  var SPEED = 230;
  function running() { return !RM && !S.paused && mapVisible && tracks.length > 0; }
  function startPackets() {
    cancelAnimationFrame(raf);
    if (RM) return;
    tracks.forEach(function (tr) {
      tr.pk = [];
      if (tr.planned) return;
      var n = tr.total > 700 ? 3 : 2;
      for (var k = 0; k < n; k++) {
        var g = sv("g", { "class": "pk", opacity: "0" }, L.packets);
        var trail = [];
        for (var j = 3; j >= 1; j--) trail.push(sv("circle", { r: 4.2 - j * 0.8, opacity: (0.5 - j * 0.12).toFixed(2), "class": "tr" }, g));
        var h = sv("circle", { "class": "h", r: 9 }, g);
        var c = sv("circle", { "class": "c", r: 3.6 }, g);
        tr.pk.push({ g: g, h: h, c: c, trail: trail, phase: k / n });
      }
    });
    t0 = performance.now(); tPause = 0;
    if (running()) raf = requestAnimationFrame(tick);
    else tPause = t0;
  }
  function pointAt(tr, s) {
    for (var i = 0; i < tr.segs.length; i++) {
      var sg = tr.segs[i];
      if (s <= sg.len) { var p = sg.el.getPointAtLength(Math.max(0, s)); return { x: p.x, y: p.y, color: sg.color, i: i }; }
      s -= sg.len;
    }
    return null;
  }
  function tick(now) {
    var t = (now - t0) / 1000;
    tracks.forEach(function (tr) {
      if (!tr.total || !tr.pk) return;
      var cycle = tr.total / SPEED + 1.2;
      tr.pk.forEach(function (p) {
        var local = t - tr.offset - 0.6 - p.phase * cycle;
        if (local < 0) { p.g.setAttribute("opacity", "0"); return; }
        var s = (local % cycle) * SPEED;
        var pt = s <= tr.total ? pointAt(tr, s) : null;
        if (!pt) { p.g.setAttribute("opacity", "0"); return; }
        p.g.setAttribute("opacity", "1");
        p.c.setAttribute("cx", pt.x); p.c.setAttribute("cy", pt.y);
        p.h.setAttribute("cx", pt.x); p.h.setAttribute("cy", pt.y);
        p.h.style.fill = pt.color;
        p.trail.forEach(function (c, j) {
          var q = pointAt(tr, s - (3 - j) * 9);
          if (q && q.i === pt.i) { c.setAttribute("cx", q.x); c.setAttribute("cy", q.y); c.style.fill = pt.color; c.style.display = ""; }
          else c.style.display = "none";
        });
      });
    });
    raf = requestAnimationFrame(tick);
  }
  function haltPackets() { if (raf) { cancelAnimationFrame(raf); raf = 0; tPause = performance.now(); } }
  function resumePackets() {
    if (!running() || raf) return;
    if (tPause) t0 += performance.now() - tPause;
    tPause = 0;
    raf = requestAnimationFrame(tick);
  }
  function setPaused(p) {
    S.paused = p;
    doc.body.classList.toggle("paused", p);
    if (p) haltPackets(); else resumePackets();
    doc.getAnimations().forEach(function (a) {
      if (a instanceof CSSAnimation || a instanceof CSSTransition) return;
      if (p) a.pause(); else if (!RM) a.play();
    });
    var b = $("#btn-play");
    b.textContent = "";
    icon(p ? "play" : "pause", b);
    b.setAttribute("aria-label", p ? U.play : U.pause);
    b.setAttribute("title", p ? U.play : U.pause);
    b.setAttribute("aria-pressed", p ? "true" : "false");
  }

  /* ---------- framing (viewBox) ---------- */
  var MINW = 380;
  function aspect() { return mqNarrow.matches ? 4 / 3 : V.w / V.h; }
  function fullVB() {
    var a = aspect(), w = V.w, h = V.h;
    if (w / h > a) h = w / a; else w = h * a;
    return [(V.w - w) / 2, (V.h - h) / 2, w, h];
  }
  function clampVB(vb) {
    var f = fullVB(), a = aspect();
    var w = Math.min(Math.max(vb[2], MINW), f[2]), h = w / a;
    var x = Math.min(Math.max(vb[0], f[0]), f[0] + f[2] - w);
    var y = Math.min(Math.max(vb[1], f[1]), f[1] + f[3] - h);
    return [x, y, w, h];
  }
  function applyVB(vb) {
    S.vb = vb;
    svg.setAttribute("viewBox", vb.map(function (v) { return v.toFixed(1); }).join(" "));
    var zoomed = vb[2] < fullVB()[2] - 1;
    svg.classList.toggle("zoomed", zoomed);
    S.fitted = zoomed;
  }
  var vbAnim = 0;
  function setVB(target, instant) {
    cancelAnimationFrame(vbAnim);
    target = clampVB(target);
    var from = S.vb.slice(), st = performance.now(), dur = RM || S.paused || keyboardAction || instant ? 0 : 320;
    if (!dur) { applyVB(target); return; }
    function step(now) {
      var k = Math.min(1, (now - st) / dur), e = 1 - Math.pow(1 - k, 3);
      applyVB(from.map(function (v, i) { return v + (target[i] - v) * e; }));
      if (k < 1) vbAnim = requestAnimationFrame(step);
    }
    vbAnim = requestAnimationFrame(step);
  }
  function fitTo(ids, pts) {
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    ids.forEach(function (id) {
      var n = N[id]; if (!n || n.kind === "router" || n.kind === "lan") return;
      x1 = Math.min(x1, n.x); y1 = Math.min(y1, n.y); x2 = Math.max(x2, n.x + n.w); y2 = Math.max(y2, n.y + n.h);
    });
    (pts || []).forEach(function (p) { x1 = Math.min(x1, p[0]); y1 = Math.min(y1, p[1]); x2 = Math.max(x2, p[0]); y2 = Math.max(y2, p[1]); });
    if (!isFinite(x1)) return fullView();
    var pad = 36; x1 -= pad; y1 -= pad; x2 += pad; y2 += pad;
    var a = aspect(), w = Math.max(x2 - x1, MINW), h = Math.max(y2 - y1, MINW / a);
    if (w / h > a) h = w / a; else w = h * a;
    var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    setVB([cx - w / 2, cy - h / 2, w, h]);
  }
  function fitSelection() {
    if (S.svc) {
      var ids = [], pts = [];
      currentRoutes().forEach(function (r) {
        var x = expandRoute(r);
        ids = ids.concat(x.nodes);
        x.legs.forEach(function (l) { l.forEach(function (sg) { pts = pts.concat(sg.pts); }); });
        routeNeeds(SV[S.svc], r).forEach(function (n) { if (!n.host) ids.push(n.node); });
      });
      fitTo(ids, pts);
    } else if (S.node) fitTo([S.node]);
    else fullView();
  }
  function fullView() { setVB(fullVB()); }
  function zoomBy(f) {
    var c = [S.vb[0] + S.vb[2] / 2, S.vb[1] + S.vb[3] / 2], a = aspect();
    var w = S.vb[2] / f, h = w / a;
    setVB([c[0] - w / 2, c[1] - h / 2, w, h]);
  }

  /* drag to pan (mouse: both axes; touch: horizontal only, the page keeps vertical scrolling) */
  var drag = null, suppressClick = false;
  svg.addEventListener("pointerdown", function (ev) {
    if (ev.button !== 0 || !svg.classList.contains("zoomed")) return;
    drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, vb: S.vb.slice(), type: ev.pointerType, moved: false };
  });
  svg.addEventListener("pointermove", function (ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    var dx = ev.clientX - drag.x, dy = drag.type === "mouse" ? ev.clientY - drag.y : 0;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      svg.classList.add("dragging");
      hideTip();
      if (drag.type === "mouse" && svg.setPointerCapture) { try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* */ } }
    }
    var r = svg.getBoundingClientRect(), k = drag.vb[2] / r.width;
    cancelAnimationFrame(vbAnim);
    applyVB(clampVB([drag.vb[0] - dx * k, drag.vb[1] - dy * k, drag.vb[2], drag.vb[3]]));
  });
  function endDrag(ev) {
    if (!drag || (ev && ev.pointerId !== drag.id)) return;
    if (drag.moved) { suppressClick = true; setTimeout(function () { suppressClick = false; }, 0); }
    svg.classList.remove("dragging");
    drag = null;
  }
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);

  /* ---------- text ---------- */
  function svcText(id) { return TX.services[id]; }
  function routeLabel(sid, rid) { return svcText(sid).routes[rid]; }

  function renderCaption() {
    var c = $("#caption"), tabs = $("#tabs");
    c.textContent = ""; tabs.textContent = "";
    var kick = el("div", { "class": "cap-kicker" }, c);
    var sw = el("span", { "class": "sw" }, kick);
    if (!S.svc) {
      kick.appendChild(doc.createTextNode(U.kOverview));
      el("h3", { "class": "cap-title" }, c, U.overviewTitle);
      el("p", { "class": "cap-desc" }, c, U.overviewDesc);
      return;
    }
    var s = SV[S.svc], tx = svcText(S.svc);
    sw.style.setProperty("--c", tv(s.tone));
    kick.appendChild(doc.createTextNode(U.kService));
    el("h3", { "class": "cap-title" }, c, tx.name);
    el("p", { "class": "cap-desc" }, c, tx.desc);
    if (s.routes.length > 1) {
      tabs.setAttribute("role", "group");
      tabs.setAttribute("aria-label", U.routes);
      var opts = s.routes.map(function (r, i) { return { v: i, label: routeLabel(S.svc, r.id), state: r.state }; });
      if (s.all) opts.unshift({ v: "all", label: U.routeAll, state: null });
      opts.forEach(function (o) {
        var b = el("button", { type: "button", "class": "tab", "aria-pressed": String(S.route === o.v) }, tabs);
        if (o.state) { var d = el("span", { "class": "d" + (o.state === "planned" ? " planned" : ""), "aria-hidden": "true" }, b); d.style.setProperty("--sc", stv(o.state)); }
        b.appendChild(doc.createTextNode(o.label));
        if (o.state && o.state !== "active") el("span", { "class": "vh" }, b, " (" + TX.statesShort[o.state] + ")");
        b.addEventListener("click", function () {
          S.route = o.v; update(true); announce();
          var active = tabs.querySelector('[aria-pressed="true"]');
          if (active) active.focus({ preventScroll: true });
        });
      });
    } else tabs.removeAttribute("role");
  }

  /* readable step-by-step version of the path, under the map */
  function stepCard(parent, id, extra, dep) {
    var li = el("li", { "class": "sc" + (dep ? " sc-dep" : "") }, parent);
    var n = N[id];
    var b = el("button", { type: "button", "class": "sc-btn", "data-pin": id }, li);
    var ic = el("span", { "class": "sc-ic", style: "--c:" + tv(n.tone || "lan") }, b);
    icon(n.icon || "net", ic);
    var tx = el("span", { "class": "sc-tx" }, b);
    el("b", null, tx, nm(id));
    var sub = extra || nsub(id);
    if (sub) el("small", null, tx, sub);
    if (!dep && n.state && n.state !== "active") {
      var st = el("span", { "class": "sc-st" + (n.state === "planned" ? " planned" : "") }, b, TX.statesShort[n.state]);
      st.style.setProperty("--sc", stv(n.state));
    }
    b.addEventListener("click", function (ev) { pinNode(id, b, ev.detail === 0); });
    return li;
  }
  function renderSteps() {
    var box = $("#steps");
    box.textContent = "";
    var head = el("div", { "class": "steps-head" }, box);
    el("h3", { "class": "steps-title" }, head, U.stepsTitle);
    if (!S.svc) { el("p", { "class": "steps-idle" }, box, U.stepsIdle); return; }
    var s = SV[S.svc], routes = currentRoutes();
    var wrap = el("div", { "class": "steps-wrap" }, box);
    routes.forEach(function (r) {
      var blk = el("div", { "class": "steps-blk" }, wrap);
      var lab = el("p", { "class": "steps-lb" }, blk);
      if (s.routes.length > 1) lab.textContent = routeLabel(S.svc, r.id); else lab.textContent = U.path;
      if (r.state !== "active") {
        var st = el("span", { "class": "sc-st" + (r.state === "planned" ? " planned" : "") }, lab, TX.statesShort[r.state]);
        st.style.setProperty("--sc", stv(r.state));
      }
      var ol = el("ol", { "class": "steps-list" }, blk);
      expandRoute(r).nodes.forEach(function (id) { stepCard(ol, id); });
    });
    var needs = [], seen = {};
    routes.forEach(function (r) { routeNeeds(s, r).forEach(function (n) { if (!seen[n.node]) { seen[n.node] = true; needs.push(n); } }); });
    if (needs.length) {
      var db = el("div", { "class": "steps-blk steps-deps" }, wrap);
      el("p", { "class": "steps-lb" }, db, U.needs);
      var ul = el("ul", { "class": "steps-list deps" }, db);
      needs.forEach(function (n) { stepCard(ul, n.node, n.host ? U.hostRel : TX.needs[n.rel], true); });
    }
  }

  function announce() {
    var live = $("#map-live"), msg;
    if (!S.svc) { msg = U.overviewTitle + ". " + U.overviewDesc; }
    else {
      var s = SV[S.svc], parts = [svcText(S.svc).name + "."];
      currentRoutes().forEach(function (r) {
        var names = expandRoute(r).nodes.map(nm);
        parts.push((s.routes.length > 1 ? routeLabel(S.svc, r.id) : U.path) + (r.state !== "active" ? " (" + TX.statesShort[r.state] + ")" : "") + ": " + names.join(U.then) + ".");
      });
      var needs = [], seen = {};
      currentRoutes().forEach(function (r) { routeNeeds(s, r).forEach(function (n) { if (!seen[n.node]) { seen[n.node] = true; needs.push(nm(n.node)); } }); });
      if (needs.length) parts.push(U.needs + ": " + needs.join(", ") + ".");
      msg = parts.join(" ");
    }
    live.textContent = msg;
  }

  /* ---------- chips ---------- */
  function renderChips() {
    var ul = $("#chips");
    ul.textContent = "";
    ul.setAttribute("aria-label", U.pickLabel);
    var items = [{ id: null, icon: "map", tone: null, label: U.overviewChip }].concat(M.services.map(function (s) {
      return { id: s.id, icon: s.icon, tone: s.tone, label: svcText(s.id).chip, full: svcText(s.id).name };
    }));
    items.forEach(function (it) {
      var li = el("li", null, ul);
      var b = el("button", { type: "button", "class": "chip", "data-svc": it.id || "", "aria-pressed": String(S.svc === it.id), title: it.full || null }, li);
      if (it.tone) b.style.setProperty("--c", tv(it.tone));
      var ic = el("span", { "class": "ic" }, b);
      icon(it.icon, ic);
      b.appendChild(doc.createTextNode(it.label));
      b.addEventListener("click", function () { selectService(it.id); });
    });
  }
  function markChips() {
    var imp = {};
    if (S.node) impactOf(S.node).forEach(function (r) { imp[r.svc] = true; });
    Array.prototype.forEach.call(doc.querySelectorAll(".chip"), function (b) {
      var id = b.getAttribute("data-svc") || null;
      b.setAttribute("aria-pressed", String(S.svc === id));
      b.classList.toggle("impact", !!(S.node && id && imp[id]));
    });
  }

  /* ---------- legend ---------- */
  function renderLegend() {
    var lg = $("#legend");
    lg.textContent = "";
    var g1 = el("div", { "class": "lg-grp" }, lg);
    el("b", null, g1, U.legendTypes);
    var dash = { vpn: null, web: null, lan: null, dns: "1 5", backup: "10 4 2 4" };
    M.edgeTypes.forEach(function (t) {
      var s = el("span", { "class": "lg" }, g1);
      var g = sv("svg", { viewBox: "0 0 34 10", "aria-hidden": "true" }, s);
      sv("line", { x1: 2, y1: 5, x2: 30, y2: 5, style: "stroke:" + tv(t) + ";stroke-width:" + (t === "dns" ? 2.6 : 2.2) + ";stroke-linecap:round" + (dash[t] ? ";stroke-dasharray:" + dash[t] : "") }, g);
      s.appendChild(doc.createTextNode(TX.types[t]));
    });
    var sd = el("span", { "class": "lg" }, g1);
    var gd = sv("svg", { viewBox: "0 0 34 10", "aria-hidden": "true" }, sd);
    sv("line", { x1: 2, y1: 5, x2: 30, y2: 5, style: "stroke:var(--dep);stroke-width:2.4;stroke-dasharray:5 4;stroke-linecap:round" }, gd);
    sd.appendChild(doc.createTextNode(U.legendDep));
    var g2 = el("div", { "class": "lg-grp" }, lg);
    el("b", null, g2, U.legendStates);
    Object.keys(M.states).forEach(function (k) {
      if (!usedStates[k]) return;
      var s = el("span", { "class": "lg" }, g2);
      var d = el("span", { "class": "dotst" + (k === "planned" ? " planned" : ""), "aria-hidden": "true" }, s);
      d.style.setProperty("--sc", stv(k));
      s.appendChild(doc.createTextNode(TX.statesShort[k]));
    });
  }

  /* ---------- tooltip ---------- */
  var tip = $("#tip"), box = $("#map-box");
  function tipNode(id) {
    var n = N[id];
    tip.textContent = "";
    el("strong", null, tip, nm(id));
    if (nsub(id) && n.kind === "node") el("div", { "class": "meta" }, tip, nsub(id));
    if (n.state && n.state !== "active") { var s = el("div", { "class": "stl" }, tip, TX.states[n.state]); s.style.setProperty("--sc", stv(n.state)); }
    el("p", null, tip, nrole(id));
    el("div", { "class": "more" }, tip, U.clickHint);
  }
  function tipEdge(id) {
    var e = E[id], tx = TX.edges[id];
    tip.textContent = "";
    el("strong", null, tip, TX.types[e.type] + (tx && tx[0] ? " · " + tx[0] : ""));
    if (e.state !== "active") { var s = el("div", { "class": "stl" }, tip, TX.states[e.state]); s.style.setProperty("--sc", stv(e.state)); }
    el("p", null, tip, (tx && tx[1]) || "");
  }
  function placeTip(cx, cy) {
    var r = box.getBoundingClientRect();
    var x = cx - r.left + 16, y = cy - r.top + 16;
    var w = tip.offsetWidth || 260, h = tip.offsetHeight || 80;
    if (x + w > r.width - 8) x = Math.max(8, cx - r.left - w - 16);
    if (y + h > r.height - 8) y = Math.max(8, cy - r.top - h - 16);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { tip.classList.remove("show"); }
  function targetOf(t) {
    var g = t && t.closest && t.closest("[data-id], [data-edge]");
    if (!g || !svg.contains(g)) return null;
    return g.hasAttribute("data-id") ? { node: g.getAttribute("data-id"), el: g } : { edge: g.getAttribute("data-edge"), el: g };
  }
  svg.addEventListener("pointermove", function (ev) {
    if (ev.pointerType !== "mouse" || drag && drag.moved) return;
    var t = targetOf(ev.target);
    if (!t) return hideTip();
    if (t.node) tipNode(t.node); else tipEdge(t.edge);
    placeTip(ev.clientX, ev.clientY);
    tip.classList.add("show");
  });
  svg.addEventListener("pointerleave", hideTip);

  /* ---------- node card / bottom sheet ---------- */
  var card = null, cardReturn = null, lastPt = { x: 0, y: 0 };
  function closeCard(silent) {
    if (card) { card.remove(); card = null; }
    if (!silent && S.node) { S.node = null; update(false); }
    if (cardReturn) {
      var target = cardReturn;
      if (!doc.body.contains(target)) {
        var id = target.getAttribute("data-pin") || target.getAttribute("data-id");
        target = id && (doc.querySelector('[data-pin="' + id + '"]') || nodeEl[id]);
      }
      if (target) { try { target.focus({ preventScroll: true }); } catch (e) { /* */ } }
    }
    cardReturn = null;
  }
  function openCard(id, fromKeyboard) {
    if (card) card.remove();
    var n = N[id], sheet = mqNarrow.matches;
    card = el("div", { "class": "card-pop" + (sheet ? " sheet" : ""), role: "dialog", "aria-label": nm(id) }, sheet ? doc.body : box);
    if (sheet) el("span", { "class": "grab", "aria-hidden": "true" }, card);
    var x = el("button", { type: "button", "class": "x", "aria-label": U.close }, card);
    icon("x", x);
    x.addEventListener("click", function () { closeCard(); });
    el("h3", null, card, nm(id));
    if (nsub(id)) el("div", { "class": "meta" }, card, nsub(id));
    if (n.state && n.state !== "active") { var s = el("div", { "class": "stl" }, card, TX.states[n.state]); s.style.setProperty("--sc", stv(n.state)); }
    el("p", null, card, nrole(id));
    var sec = el("div", { "class": "sec" }, card);
    el("b", null, sec, U.ifDown);
    var list = el("div", { "class": "list" }, sec);
    var imp = impactOf(id);
    if (!imp.length) el("span", null, list, U.ifDownNone);
    imp.forEach(function (r) {
      var b = el("button", { type: "button", "class": "step bad" }, list);
      b.textContent = svcText(r.svc).chip;
      if (!r.all) el("i", null, b, " · " + r.routes.map(function (rid) { return routeLabel(r.svc, rid); }).join(", "));
      b.addEventListener("click", function () {
        var s = SV[r.svc];
        closeCard(true); S.node = null;
        selectService(r.svc, r.all ? (s.all ? "all" : 0) : s.routes.map(function (q) { return q.id; }).indexOf(r.routes[0]));
      });
    });
    function rel(label, ids) {
      var p = el("div", { "class": "sec" }, card);
      el("b", null, p, label);
      var pl = el("div", { "class": "list" }, p);
      ids.forEach(function (c) {
        var b = el("button", { type: "button", "class": "step", "data-pin": c }, pl, nm(c));
        b.addEventListener("click", function () { pinNode(c, b, true); });
      });
    }
    if (n.parent) rel(U.partOf, [n.parent]);
    if ((CH[id] || []).length) rel(U.contains, CH[id]);
    if (!sheet) {
      var br = box.getBoundingClientRect(), nr = nodeEl[id].getBoundingClientRect();
      var w = card.offsetWidth, h = card.offsetHeight;
      var left = Math.min(Math.max(8, nr.left - br.left + nr.width / 2 - w / 2), br.width - w - 8);
      if (n.kind !== "node") left = Math.min(Math.max(8, (lastPt.x || nr.left) - br.left - w / 2), br.width - w - 8);
      var top = nr.bottom - br.top + 10;
      if (n.kind === "group" || n.kind === "lan") top = (lastPt.y || nr.top) - br.top + 14;
      if (top + h > br.height - 8) top = Math.max(8, nr.top - br.top - h - 10);
      if (top + h > br.height - 8) top = Math.max(8, br.height - h - 8);
      card.style.left = left + "px"; card.style.top = top + "px";
    }
    if (fromKeyboard || sheet) x.focus({ preventScroll: true });
  }
  function pinNode(id, returnTo, fromKeyboard) {
    hideTip();
    if (S.node === id && card) { closeCard(); return; }
    S.node = id;
    if (!card) cardReturn = returnTo || nodeEl[id] || null;
    update(false);
    var fromMap = returnTo && svg.contains(returnTo);
    var r = nodeEl[id] && nodeEl[id].getBoundingClientRect();
    if (r && !fromMap) { lastPt.x = r.left + r.width / 2; lastPt.y = r.top + r.height / 2; }
    openCard(id, fromKeyboard);
    if (!fromMap && card && !mqNarrow.matches && card.scrollIntoView) card.scrollIntoView({ block: "nearest", behavior: RM ? "auto" : "smooth" });
    if (mqNarrow.matches && N[id].kind === "node") fitTo([id]);
  }

  svg.addEventListener("click", function (ev) {
    if (suppressClick) return;
    lastPt.x = ev.clientX; lastPt.y = ev.clientY;
    var t = targetOf(ev.target);
    if (t && t.node) pinNode(t.node, t.el, ev.detail === 0);
    else if (S.node) closeCard();
  });
  svg.addEventListener("keydown", function (ev) {
    var t = targetOf(ev.target);
    if (!t || !t.node) return;
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      var r = t.el.getBoundingClientRect();
      lastPt.x = r.left + r.width / 2; lastPt.y = r.top + r.height / 2;
      pinNode(t.node, t.el, true);
    }
  });
  svg.addEventListener("focusin", function (ev) {
    var t = targetOf(ev.target);
    if (!t || !t.node || mqCoarse.matches) return;
    tipNode(t.node);
    var r = t.el.getBoundingClientRect();
    placeTip(r.left + Math.min(r.width, 200) / 2, r.bottom - 6);
    tip.classList.add("show");
  });
  svg.addEventListener("focusout", hideTip);
  doc.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    if (card) { closeCard(); return; }
    var sec = $("#map");
    if (S.svc && sec.contains(doc.activeElement)) selectService(null);
  });
  doc.addEventListener("click", function (ev) {
    if (card && !card.contains(ev.target) && !svg.contains(ev.target) && !(ev.target.closest && ev.target.closest("[data-pin]"))) closeCard();
  });

  /* ---------- update ---------- */
  function update(reframe) {
    applyMap();
    renderCaption();
    renderSteps();
    markChips();
    if (reframe) { if (S.svc && (S.fitted || mqNarrow.matches)) fitSelection(); else if (!S.svc) fullView(); }
  }
  function selectService(id, route) {
    if (card) closeCard(true);
    S.node = null;
    S.svc = id;
    var s = id ? SV[id] : null;
    S.route = (route != null && route >= 0) || route === "all" ? route : (s && s.all ? "all" : 0);
    update(true);
    announce();
  }

  /* ---------- tools ---------- */
  function renderTools() {
    var t = $("#map-tools");
    t.setAttribute("aria-label", U.toolsLabel);
    [["btn-zout", "minus", U.zoomOut, function () { zoomBy(1 / 1.4); }],
     ["btn-zin", "plus", U.zoomIn, function () { zoomBy(1.4); }],
     ["btn-fit", "fit", U.fit, fitSelection],
     ["btn-full", "full", U.full, fullView],
     ["btn-play", "pause", U.pause, function () { setPaused(!S.paused); }]].forEach(function (b) {
      var btn = el("button", { type: "button", "class": "tool", id: b[0], "aria-label": b[2], title: b[2] }, t);
      icon(b[1], btn);
      btn.addEventListener("click", b[3]);
    });
    if (RM) $("#btn-play").hidden = true;
    $("#map-hint").textContent = U.hint;
  }

  function setAspect() { svg.style.aspectRatio = mqNarrow.matches ? "4 / 3" : V.w + " / " + V.h; }

  /* ---------- start ---------- */
  renderHeader();
  setupHeaderScroll();
  renderHero();
  secHead($("#map-head"), P.mapHead, "map-h");
  $("#pick-h").textContent = U.pickTitle;
  $("#pick-p").textContent = U.pickHint;
  renderPrinciples();
  renderStack();
  renderFooter();
  renderTheme();

  setAspect();
  S.vb = fullVB();
  renderTools();
  build(false);
  if (!RM && "IntersectionObserver" in window) svg.classList.add("pre");
  renderChips();
  renderLegend();
  update(false);
  setPaused(false);
  setupReveal();
  setupHeroPause();

  onMq(mqRM, function () {
    RM = mqRM.matches;
    cancelAnimationFrame(vbAnim);
    svg.classList.remove("pre", "intro");
    doc.getAnimations().forEach(function (a) {
      if (!(a instanceof CSSAnimation) && !(a instanceof CSSTransition)) a.cancel();
    });
    doc.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("in"); });
    $("#btn-play").hidden = RM;
    update(false);
  });

  onMq(mqNarrow, function () {
    if (card) closeCard(true);
    setAspect();
    applyVB(fullVB());
    if (S.svc && mqNarrow.matches) fitSelection();
  });

  if ("IntersectionObserver" in window) {
    var introDone = false;
    new IntersectionObserver(function (en) {
      mapVisible = en[0].isIntersecting;
      if (mapVisible && !introDone) {
        introDone = true;
        if (!RM) { build(true); update(false); }
      }
      if (mapVisible) resumePackets(); else haltPackets();
    }, { threshold: 0.12 }).observe($("#map-box"));
  }

  window.__homelab = { DATA: DATA, S: S, selectService: selectService, pinNode: pinNode, impactOf: impactOf, expandRoute: expandRoute, fitSelection: fitSelection, zoomBy: zoomBy };
})();
