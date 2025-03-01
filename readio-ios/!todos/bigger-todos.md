<!-- TODO -->

So I am about to change the layout to fit what I talked about with baba

The Home is now not part of the tab bar. The tab bar are just our main core functions that were offering our users which makes sense. Home will be part of the header that I made and because of that it needs to be removed from the tap bar.

Now in doing this, I have to also update all of the current routes that are pointing to home in the first place.

What I'm considering doing is just making a file called routes-something and putting all the routes there so in case I have to switch this around again all I would have to do is change it there instead of having to go in file and do it manually like that.

Once I do remove Home from the tab bar, I will have to put this in the search:

(home)/

And then update pages that are using this route.

But again after I really before I do this, I'm probably gonna make a file called routes, place All of my routes in there and then kind of just import them into all the different projects that would need. I would rather do that then have to keep this doing this the older way going forward.