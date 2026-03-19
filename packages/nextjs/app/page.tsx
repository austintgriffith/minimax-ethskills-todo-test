"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base } from "viem/chains";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth/notification";
import { getParsedError } from "~~/utils/scaffold-eth/getParsedError";
import deployedContracts from "~~/contracts/deployedContracts";
// -------------------------------------------------------------------------
// Contract address — placeholder, will be updated after deploy
// ---------------------------------------------------------------------------
const CONTRACT_NAME = "TodoList";
const CONTRACT_ADDRESS = (() => {
  try {
    const chain = (deployedContracts as any)?.[base.id]?.[CONTRACT_NAME];
    return chain?.address || "0x0000000000000000000000000000000000000000";
  } catch {
    return "0x0000000000000000000000000000000000000000";
  }
})();

// ---------------------------------------------------------------------------
// Todo item type
// ---------------------------------------------------------------------------
interface Todo {
  content: string;
  completed: boolean;
  createdAt: bigint;
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function TodoListPage() {
  // Prevent SSR static prerender crash — wagmi hooks need client context
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Don't render anything until mounted (client-side only)
  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const wrongNetwork = isConnected && chainId !== base.id;

  // ---------------------------------------------------------------------------
  // Loading states — SEPARATE per action, NEVER shared
  // ---------------------------------------------------------------------------
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleting, setIsCompleting] = useState<number | null>(null);
  const [isUncompleting, setIsUncompleting] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [newTodo, setNewTodo] = useState("");
  const [txError, setTxError] = useState<string | null>(null);
  // ---------------------------------------------------------------------------
  // Read: todo count + paginated todos
  // ---------------------------------------------------------------------------
  const PAGE_SIZE = 20;

  const { data: todoCount } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "userTodos",
    args: [userAddress || "0x0000000000000000000000000000000000000001", 0n],
  }) as { data: bigint | undefined };

  const { data: paginatedTodos, refetch: refetchPaginated } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "getTodos",
    args: [userAddress || "0x0000000000000000000000000000000000000001", 0n, BigInt(PAGE_SIZE)],
  }) as { data: Todo[] | undefined; refetch: () => void };

  const todos = paginatedTodos || [];

  // Force refresh after writes
  const refresh = useCallback(() => {
    refetchPaginated();
  }, [refetchPaginated]);

  // ---------------------------------------------------------------------------
  // Write: create todo
  // ---------------------------------------------------------------------------
  const { writeContractAsync: createWriteAsync } = useScaffoldWriteContract({
    contractName: CONTRACT_NAME,
  });

  const handleCreate = async () => {
    if (!newTodo.trim()) return;
    setIsCreating(true);
    setTxError(null);
    try {
      await createWriteAsync({
        functionName: "createTodo",
        args: [newTodo.trim()],
      });
      setNewTodo("");
      refresh();
    } catch (err: any) {
      const msg = getParsedError(err);
      setTxError(msg || "Failed to create todo");
      notification.error(msg || "Failed to create todo");
    } finally {
      setIsCreating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Write: complete todo
  // ---------------------------------------------------------------------------
  const { writeContractAsync: completeWriteAsync } = useScaffoldWriteContract({
    contractName: CONTRACT_NAME,
  });

  const handleComplete = async (id: number) => {
    setIsCompleting(id);
    setTxError(null);
    try {
      await completeWriteAsync({
        functionName: "completeTodo",
        args: [BigInt(id)],
      });
      refresh();
    } catch (err: any) {
      const msg = getParsedError(err);
      setTxError(msg || "Failed to complete todo");
      notification.error(msg || "Failed to complete todo");
    } finally {
      setIsCompleting(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Write: uncomplete todo
  // ---------------------------------------------------------------------------
  const { writeContractAsync: uncompleteWriteAsync } = useScaffoldWriteContract({
    contractName: CONTRACT_NAME,
  });

  const handleUncomplete = async (id: number) => {
    setIsUncompleting(id);
    setTxError(null);
    try {
      await uncompleteWriteAsync({
        functionName: "uncompleteTodo",
        args: [BigInt(id)],
      });
      refresh();
    } catch (err: any) {
      const msg = getParsedError(err);
      setTxError(msg || "Failed to uncomplete todo");
      notification.error(msg || "Failed to uncomplete todo");
    } finally {
      setIsUncompleting(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Write: delete todo
  // ---------------------------------------------------------------------------
  const { writeContractAsync: deleteWriteAsync } = useScaffoldWriteContract({
    contractName: CONTRACT_NAME,
  });

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    setTxError(null);
    try {
      await deleteWriteAsync({
        functionName: "deleteTodo",
        args: [BigInt(id)],
      });
      refresh();
    } catch (err: any) {
      const msg = getParsedError(err);
      setTxError(msg || "Failed to delete todo");
      notification.error(msg || "Failed to delete todo");
    } finally {
      setIsDeleting(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {/* Header */}
      <div className="w-full border-b border-base-300 bg-base-100 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-base-content">📋 onchain TodoList</h1>
            <p className="text-sm text-base-content/60">Built on Base · following ethskills.com</p>
          </div>
          <div className="text-right">
            <Address address={CONTRACT_ADDRESS} />
            <p className="mt-1 text-xs text-base-content/40">Contract</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* ----------------------------------------
            STATE 1: Not connected — Connect Wallet
            ---------------------------------------- */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="mb-6 text-lg text-base-content/60">Connect your wallet to manage todos onchain</p>
          </div>
        )}

        {/* ----------------------------------------
            STATE 2: Wrong network — Switch to Base
            ---------------------------------------- */}
        {isConnected && wrongNetwork && (
          <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl bg-base-100 p-8 text-center">
            <p className="text-lg font-medium">Switch to Base to use this dApp</p>
            <button
              className="btn btn-primary"
              disabled={isSwitchingChain}
              onClick={() => switchChain({ chainId: base.id })}
            >
              {isSwitchingChain ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2" />
                  Switching...
                </>
              ) : (
                "Switch to Base"
              )}
            </button>
          </div>
        )}

        {/* ----------------------------------------
            STATE 3 & 4: Connected + right network
            ---------------------------------------- */}
        {isConnected && !wrongNetwork && (
          <>
            {/* Create new todo */}
            <div className="mb-8 rounded-2xl bg-base-100 p-6">
              <h2 className="mb-4 text-lg font-semibold">New Todo</h2>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTodo}
                  onChange={e => {
                    setNewTodo(e.target.value);
                    if (txError) setTxError(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !isCreating && newTodo.trim()) handleCreate();
                  }}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  disabled={isCreating}
                />
                <button
                  className="btn btn-primary w-full"
                  disabled={isCreating || !newTodo.trim()}
                  onClick={handleCreate}
                >
                  {isCreating ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Add Todo"
                  )}
                </button>
              </div>
              {txError && (
                <div className="alert alert-error mt-4 text-sm">
                  <span>{txError}</span>
                </div>
              )}
            </div>

            {/* Todo list */}
            <div className="space-y-3">
              <h2 className="mb-2 text-lg font-semibold">
                Your Todos
                {typeof todoCount === "bigint" && (
                  <span className="ml-2 rounded-full bg-base-300 px-3 py-1 text-sm font-normal">
                    {todoCount.toString()}
                  </span>
                )}
              </h2>

              {todos.length === 0 && (
                <div className="rounded-2xl bg-base-100 p-12 text-center text-base-content/40">
                  No todos yet — add one above 👆
                </div>
              )}

              {todos.map((todo: Todo, index: number) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 rounded-2xl bg-base-100 p-4 transition-all ${
                    todo.completed ? "opacity-60" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <label className="mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={todo.completed}
                      onChange={() => {
                        if (todo.completed) {
                          if (isUncompleting === index) return;
                          handleUncomplete(index);
                        } else {
                          if (isCompleting === index) return;
                          handleComplete(index);
                        }
                      }}
                      disabled={isCompleting === index || isUncompleting === index}
                    />
                  </label>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`break-words ${
                        todo.completed ? "text-base-content/50 line-through" : "text-base-content"
                      }`}
                    >
                      {todo.content}
                    </p>
                    <p className="mt-1 text-xs text-base-content/40">
                      Added {new Date(Number(todo.createdAt) * 1000).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* Complete / Uncomplete button */}
                    {!todo.completed ? (
                      <button
                        className="btn btn-sm btn-success"
                        disabled={isCompleting === index}
                        onClick={() => handleComplete(index)}
                        title="Mark complete"
                      >
                        {isCompleting === index ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          "✓"
                        )}
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-ghost"
                        disabled={isUncompleting === index}
                        onClick={() => handleUncomplete(index)}
                        title="Mark incomplete"
                      >
                        {isUncompleting === index ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          "↩"
                        )}
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      className="btn btn-sm btn-error btn-outline"
                      disabled={isDeleting === index}
                      onClick={() => handleDelete(index)}
                      title="Delete todo"
                    >
                      {isDeleting === index ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        "🗑"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
