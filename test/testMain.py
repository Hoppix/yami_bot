"""Created by khopf on 29/11/2019."""

from utility import utility


def test_isSameUserName() -> None:
    assert utility.isSameUserName("john#1234", "john#1234")
    assert utility.isSameUserName("john", "john")
    assert utility.isSameUserName("john#1234", "john")
    assert utility.isSameUserName("john", "john#1234")
    assert utility.isSameUserName("jOhn", "john#1234")
    assert utility.isSameUserName("john", "John#1234")

    assert not utility.isSameUserName("john#1234", "john#")
    assert not utility.isSameUserName("john#12", "john#1234")

    assert not utility.isSameUserName("john4", "fredur")
    assert not utility.isSameUserName("john4#12", "fredur#1234")
    assert not utility.isSameUserName("john4#1234", "fredur#1234")
