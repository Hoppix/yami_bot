/**
 * Created by khopf on 29/11/2019.
 */
import { equal } from 'assert';
import { isSameUserName } from "../src/utility/utility.js";


describe('UtilityTest', function() {
    it('Testing the utility module', function() {

        
        equal(isSameUserName("john#1234", "john#1234"), true);
        equal(isSameUserName("john", "john"), true);
        equal(isSameUserName("john#1234", "john"), true);
        equal(isSameUserName("john", "john#1234"), true);
        equal(isSameUserName("jOhn", "john#1234"), true);
        equal(isSameUserName("john", "John#1234"), true);

        equal(isSameUserName("john#1234", "john#"), false);
        equal(isSameUserName("john#12", "john#1234"), false);

        equal(isSameUserName("john4", "fredur"), false);
        equal(isSameUserName("john4#12", "fredur#1234"), false);
        equal(isSameUserName("john4#1234", "fredur#1234"), false);

        equal(isSameUserName("john#1234", "john#"), false);
        equal(isSameUserName("john#12", "john#1234"), false);


    });
});
