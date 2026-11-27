"""Created by khopf on 29/11/2019."""

from utility import utility


def test_is_same_user_name() -> None:
    assert utility.is_same_user_name("john#1234", "john#1234")
    assert utility.is_same_user_name("john", "john")
    assert utility.is_same_user_name("john#1234", "john")
    assert utility.is_same_user_name("john", "john#1234")
    assert utility.is_same_user_name("jOhn", "john#1234")
    assert utility.is_same_user_name("john", "John#1234")

    assert not utility.is_same_user_name("john#1234", "john#")
    assert not utility.is_same_user_name("john#12", "john#1234")

    assert not utility.is_same_user_name("john4", "fredur")
    assert not utility.is_same_user_name("john4#12", "fredur#1234")
    assert not utility.is_same_user_name("john4#1234", "fredur#1234")
