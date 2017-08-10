City and County of San Francisco Open Source Portal
================

Portal for the City and County of San Francisco's Open Source projects hosted on GitHub.

This is an minimal implementation of a portal for San Francisco's GitHub hosted open source projects. It's primary goal is to help the City and County coordinate many organizational repos across San Francisco in one easy to find place. The hope is that this serves to encourage other agencies looking to participate in open source projects to start hosting their own repos. Given the relatively decentralized structure of departments, this portal helps departments and agencies maintain a level of autonomy in their open source projects, while allowing people outside government to find projects across the City in one place.


## If you're an SF Agency/Department that would like to be listed here

### You already have a GitHub organizational account

1. Go to [main.js](https://github.com/SFMOCI/sfmoci.github.io/blob/master/main.js) and click edit
2. Use the web-based editor to add your GitHub organizational account name at the top of main.js
3. Below the editor window, there's a box to enter a required message, enter something like "Added organization SFO to the portal"
4. Click Propose File Change at the bottom
5. You can review changes on the next screen and to finish the edit, click the green button labeled "Send Pull Request"

OR

**Don't feel comfortable editing the code directly?**

1. [Submit an issue](https://github.com/SFMOCI/sfmoci.github.io/issues/new) with your organizational account link and we'll add it.

### You don't have a GitHub organizational account, but want to learn more?

- If you're a user on GitHub, go ahead and [submit an issue](https://github.com/SFMOCI/sfmoci.github.io/issues/new) and we'll get in touch
- Or reach out directly to Jason Lally at the Mayor's Office of Civic Innovation

## Contributing

The portal was built very simply in the interest of delivering something of basic value. That being said, there's much room for improvement and we'll hopefully be layering things in over time. We welcome feedback and participation from anyone interested. A couple of things we've been thinking about:

- Quick filters for topics/departments/code
- More basic stats on each repo in plain view
- Contributors included

At this stage, the open source work across the City is fairly young, so a lot of the above listed features aren't entirely useful yet. We hope to grow participation in projects built out in the open as more departments find their way to the open source community.

If you want to contribute code, we encourage you to reach out over the issues first by either proposing a feature/change or asking questions there. Code can be contributed through pull requests.

## Credit

This portal is built on open source tools and frameworks:

1. Bootstrap for the UI elements and fundamentals
2. jQuery, a modern javascript framework
3. The code in main.js is taken and modified from Twitter's [own open source portal](https://github.com/twitter/twitter.github.com), special thanks for the ranking algorithm that automatically orders repos based on push date and number of watchers.

## License

Copyright 2014 City and County of San Francisco

Licensed under the MIT License
