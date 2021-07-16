module.exports = {

    /**
     * Helper function to load all entities of a particular manager
     *
     **/
    fetchCache: function(oBaseManager, id) {
        console.log("Fetching cache ...");
        let aResult = [];
        try {

            let aCache = oBaseManager.cache.array();

            for (const entity of aCache) {
                console.log("cached ", entity.id);
                aResult.push(entity.id);
            }
        } catch (oError) {
          console.log("Error while fetching cache: ", err);
        }

        return aResult;
    }
}
