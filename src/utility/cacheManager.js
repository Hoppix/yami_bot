module.exports = {

    /**
     * Helper function to load all entities of a particular manager
     *
     **/
    fetchCache: function(oBaseManager, id) {
        console.log("Fetching cache ...");
        let aResult = [];

        if(!oBaseManager) return;

        try {

            let aCache = oBaseManager.cache;

            for (const entity of aCache) {
                console.log("cached ", entity[0]);
                aResult.push(entity);
            }
        } catch (oError) {
          console.log("Error while fetching cache: ", oError);
        }

        return aResult;
    }
}
