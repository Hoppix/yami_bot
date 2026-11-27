/**
 * Created by khopf on 29/11/2019.
 */
import assert from "assert";
import utility from "../src/utility/utility";

describe("UtilityTest", function () {
    it("Testing the utility module", function () {
        assert.equal(utility.isSameUserName("john#1234", "john#1234"), true);
        assert.equal(utility.isSameUserName("john", "john"), true);
        assert.equal(utility.isSameUserName("john#1234", "john"), true);
        assert.equal(utility.isSameUserName("john", "john#1234"), true);
        assert.equal(utility.isSameUserName("jOhn", "john#1234"), true);
        assert.equal(utility.isSameUserName("john", "John#1234"), true);

        assert.equal(utility.isSameUserName("john#1234", "john#"), false);
        assert.equal(utility.isSameUserName("john#12", "john#1234"), false);

        assert.equal(utility.isSameUserName("john4", "fredur"), false);
        assert.equal(utility.isSameUserName("john4#12", "fredur#1234"), false);
        assert.equal(utility.isSameUserName("john4#1234", "fredur#1234"), false);

        assert.equal(utility.isSameUserName("john#1234", "john#"), false);
        assert.equal(utility.isSameUserName("john#12", "john#1234"), false);
    });
});
