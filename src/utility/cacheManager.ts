import { Collection } from "discord.js";

const cacheManager = {
    /**
     * Helper function to load all entities of a particular manager
     **/
    fetchCache<K, V>(oBaseManager: { cache: Collection<K, V> } | null | undefined): Array<[K, V]> {
        console.log("Fetching cache ...");
        const aResult: Array<[K, V]> = [];

        if (!oBaseManager) return aResult;

        try {
            for (const entity of oBaseManager.cache) {
                console.log("cached ", entity[0]);
                aResult.push(entity);
            }
        } catch (oError) {
            console.log("Error while fetching cache: ", oError);
        }

        return aResult;
    },
};

export default cacheManager;
