// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {TodoList} from "../contracts/TodoList.sol";

contract TodoListTest is Test {
    TodoList public todoList;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    // ---------------------------------------------------------------------------
    // Events (re-declared here so tests can emit them)
    // ---------------------------------------------------------------------------
    event TodoCreated(address indexed user, uint256 indexed todoId, string content);
    event TodoCompleted(address indexed user, uint256 indexed todoId);
    event TodoDeleted(address indexed user, uint256 indexed todoId);

    // ---------------------------------------------------------------------------
    // Setup
    // ---------------------------------------------------------------------------
    function setUp() public {
        todoList = new TodoList();
    }

    // ---------------------------------------------------------------------------
    // createTodo tests
    // ---------------------------------------------------------------------------
    function test_createTodo() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("Buy groceries");

        (string memory content, bool completed, uint256 createdAt) = todoList.getTodo(alice, id);

        assertEq(content, "Buy groceries");
        assertFalse(completed);
        assertGt(createdAt, 0);
    }

    function test_createTodo_IncrementsCount() public {
        vm.prank(alice);
        todoList.createTodo("Todo 1");
        vm.prank(alice);
        todoList.createTodo("Todo 2");
        vm.prank(alice);
        todoList.createTodo("Todo 3");

        assertEq(todoList.getTodoCount(alice), 3);
    }

    function test_createTodo_EmptyContent_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(TodoList.TodoList__EmptyContent.selector);
        todoList.createTodo("");
    }

    function test_createTodo_EmptyContent_Whitespace_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(TodoList.TodoList__EmptyContent.selector);
        todoList.createTodo("   ");
    }

    function test_createTodo_EmitEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit TodoCreated(alice, 0, "Buy groceries");
        todoList.createTodo("Buy groceries");
    }

    function testFuzz_createTodo(string calldata content) public {
        // Test non-whitespace non-empty strings
        bytes memory b = bytes(content);
        bool allSpaces = true;
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] != bytes1(0x20)) {
                allSpaces = false;
                break;
            }
        }
        vm.assume(b.length > 0 && !allSpaces);

        vm.prank(alice);
        uint256 id = todoList.createTodo(content);

        (string memory stored, bool completed,) = todoList.getTodo(alice, id);
        assertEq(stored, content);
        assertFalse(completed);
    }

    // ---------------------------------------------------------------------------
    // completeTodo tests
    // ---------------------------------------------------------------------------
    function test_completeTodo() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("Buy groceries");

        vm.prank(alice);
        todoList.completeTodo(id);

        (, bool completed,) = todoList.getTodo(alice, id);
        assertTrue(completed);
    }

    function test_completeTodo_EmitEvent() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("Buy groceries");

        vm.prank(alice);
        vm.expectEmit(true, true, false, false);
        emit TodoCompleted(alice, id);
        todoList.completeTodo(id);
    }

    function test_completeTodo_AlreadyCompleted_Reverts() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("Buy groceries");
        vm.prank(alice);
        todoList.completeTodo(id);

        vm.prank(alice);
        vm.expectRevert(TodoList.TodoList__AlreadyCompleted.selector);
        todoList.completeTodo(id);
    }

    function test_completeTodo_IndexOutOfBounds_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(TodoList.TodoList__IndexOutOfBounds.selector);
        todoList.completeTodo(0);
    }

    function testFuzz_completeTodo(uint256 id) public {
        vm.assume(id > 1000);
        vm.prank(alice);
        vm.expectRevert(TodoList.TodoList__IndexOutOfBounds.selector);
        todoList.completeTodo(id);
    }

    // ---------------------------------------------------------------------------
    // uncompleteTodo tests
    // ---------------------------------------------------------------------------
    function test_uncompleteTodo() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("Buy groceries");
        vm.prank(alice);
        todoList.completeTodo(id);

        vm.prank(alice);
        todoList.uncompleteTodo(id);

        (, bool completed,) = todoList.getTodo(alice, id);
        assertFalse(completed);
    }

    function test_uncompleteTodo_NotCompleted_Reverts() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("Buy groceries");

        vm.prank(alice);
        vm.expectRevert(TodoList.TodoList__NotCompleted.selector);
        todoList.uncompleteTodo(id);
    }

    // ---------------------------------------------------------------------------
    // deleteTodo tests
    // ---------------------------------------------------------------------------
    function test_deleteTodo_LastItem() public {
        vm.prank(alice);
        todoList.createTodo("Todo 1");
        vm.prank(alice);
        uint256 id2 = todoList.createTodo("Todo 2");
        vm.prank(alice);
        todoList.createTodo("Todo 3");

        vm.prank(alice);
        todoList.deleteTodo(id2);

        assertEq(todoList.getTodoCount(alice), 2);
    }

    function test_deleteTodo_SingleItem() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("Solo todo");
        assertEq(todoList.getTodoCount(alice), 1);

        vm.prank(alice);
        todoList.deleteTodo(id);

        assertEq(todoList.getTodoCount(alice), 0);
    }

    function test_deleteTodo_IndexOutOfBounds_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(TodoList.TodoList__IndexOutOfBounds.selector);
        todoList.deleteTodo(0);
    }

    function test_deleteTodo_EmitEvent() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("To delete");

        vm.prank(alice);
        vm.expectEmit(true, true, false, false);
        emit TodoDeleted(alice, id);
        todoList.deleteTodo(id);
    }

    // ---------------------------------------------------------------------------
    // Pagination / getTodos tests
    // ---------------------------------------------------------------------------
    function test_getTodos_Pagination() public {
        for (uint256 i = 0; i < 10; i++) {
            vm.prank(alice);
            todoList.createTodo(string.concat("Todo ", vm.toString(i)));
        }

        TodoList.Todo[] memory page1 = todoList.getTodos(alice, 0, 3);
        assertEq(page1.length, 3);
        assertEq(page1[0].content, "Todo 0");
        assertEq(page1[1].content, "Todo 1");
        assertEq(page1[2].content, "Todo 2");

        TodoList.Todo[] memory page2 = todoList.getTodos(alice, 3, 3);
        assertEq(page2.length, 3);
        assertEq(page2[0].content, "Todo 3");
    }

    function test_getTodos_OffsetBeyondLength_ReturnsEmpty() public {
        TodoList.Todo[] memory result = todoList.getTodos(alice, 999, 10);
        assertEq(result.length, 0);
    }

    // ---------------------------------------------------------------------------
    // Isolation tests
    // ---------------------------------------------------------------------------
    function test_todosAreIsolatedByOwner() public {
        vm.prank(alice);
        todoList.createTodo("Alice's todo");

        vm.prank(bob);
        todoList.createTodo("Bob's todo");

        assertEq(todoList.getTodoCount(alice), 1);
        assertEq(todoList.getTodoCount(bob), 1);

        (, bool aliceCompleted,) = todoList.getTodo(alice, 0);
        (, bool bobCompleted,) = todoList.getTodo(bob, 0);

        assertFalse(aliceCompleted);
        assertFalse(bobCompleted);
    }

    // ---------------------------------------------------------------------------
    // Edge cases
    // ---------------------------------------------------------------------------
    function test_completeTodo_OtherUsersTodo_Reverts() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("Alice's todo");

        vm.prank(bob);
        vm.expectRevert(TodoList.TodoList__IndexOutOfBounds.selector);
        todoList.completeTodo(id);
    }

    function test_deleteTodo_AfterComplete() public {
        vm.prank(alice);
        uint256 id = todoList.createTodo("To complete and delete");
        vm.prank(alice);
        todoList.completeTodo(id);

        vm.prank(alice);
        todoList.deleteTodo(id);

        assertEq(todoList.getTodoCount(alice), 0);
    }

    // ---------------------------------------------------------------------------
    // Invariants
    // ---------------------------------------------------------------------------
    function invariant_TodoCountNeverNegative() public view {
        for (uint256 i = 0; i < 10; i++) {
            address user = address(uint160(i + 1));
            assertGe(todoList.getTodoCount(user), 0);
        }
    }
}
