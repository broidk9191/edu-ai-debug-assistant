| ID  | Case Type                     | Language | Description                   |
| --- | ----------------------------- | -------- | ----------------------------- |
| TC1 | Debug request                 | Python   | Off-by-one error in loop      |
| TC2 | Debug request                 | Java     | Null/Uninitialized variable   |
| TC3 | Debug request                 | C++      | Infinite loop                 |
| TC4 | Assignment help request       | Any      | "Do my homework"              |
| TC5 | Assignment conceptual request | Any      | "How do I implement sorting?" |

***assignment help prompt 过于敏感，得让他正常生成，不能每次都拒绝用户

Test Case ID: TC1
Category: Debug request
Language: Python
Description: Off-by-one error in loop
Test Model: GPT-5 mini

# Test Prompt:
"I wrote the following Python code to print numbers from 1 to 10, but it seems to skip the last number. Can you help me find the bug?"

```python
for i in range(1, 10):
    print(i)
```

## Output without Assignment_help and Debug prompts:

The end value in range() is exclusive, so range(1, 10) stops at 9. Use 11 as the end to include 10:

```python
for i in range(1, 11):
    print(i)
```

### Output with Debug prompt:

- Short summary: Likely off-by-one in the loop range — `range(1, 10)` excludes 10 so the code prints 1..9 (issue at the `range` call).
- Root cause (concise): Python's `range(start, stop)` is half-open: `stop` is exclusive. Using `10` as the stop means `10` is not iterated.
- Guided hints:
  - Hint 1 (high-level): Check whether the range's stop value should be increased so the inclusive upper bound is reached.
- Tiny experiment (1–2 lines):
```python
# inspect the sequence produced by range to see what's included
print(list(range(1, 10)))  # shows values produced by the loop
```
- Reflection questions:
  - Why does `range` exclude the stop value, and how does that affect loop boundaries?
  - How would you change the `range` so the loop includes 10?

Metadata (internal):
```json
{"diagnosis_confidence":"high","safety_decision":"allow","hint_level":1,"lines_referenced":[1]}
```

#### Output with Assignment_help prompt:

Guidance — explanation (plain language)
- Python’s range(start, end) is half-open: it includes start but excludes end. range(1, 10) yields 1..9, so 10 is omitted.

Why I won’t dump a full solution
- I prioritize learning and academic integrity, so I avoid producing submit-ready solutions.

Approaches / thinking paths (no step-by-step code)
- Inspect the loop header and language docs to confirm range semantics.
- Decide whether you need an inclusive endpoint; adjust the end value accordingly (make the exclusive end one larger) or use a different iteration pattern.
- Run a tiny experiment locally to observe the produced sequence and validate your change.
- If this is part of an assignment, apply the reasoning above and test incrementally.

Reflective questions
- Why do some APIs use half-open intervals, and what advantages does that give?
- How would you write tests to catch off-by-one errors in loops?

Debug redirect
- If you want a targeted hint on your exact snippet or observed output, state whether this is an assignment and paste the minimal code/error; I’ll give focused, non‑submit‑ready debugging guidance.

Metadata
```json
{"safety_decision":"allow","diagnosis_confidence":"high","hint_level":3,"lines_referenced":[1,2]}
```


Test Case ID: TC2
Category: Debug request
Language: Java
Description: Null/Uninitialized variable
Test Model: GPT-5 mini

# Test Prompt:
"I wrote the following Java code, but it throws a NullPointerException. Can you help me find the issue?"

```java
public class Main {
    public static void main(String[] args) {
        String message;
        System.out.println(message.length());
    }
}
```

## Output without Assignment_help and Debug prompts:

Issue (concise): the local variable `message` is not initialized — as written this is a compile error. A NullPointerException would occur if `message` is null at runtime (e.g., a field or explicitly set to null). Fix by initializing or null-checking.

Example — initialize:
```java
public class Main {
    public static void main(String[] args) {
        String message = "Hello";
        System.out.println(message.length());
    }
}
```

Example — null-safe:
```java
public class Main {
    public static void main(String[] args) {
        String message = null;
        System.out.println(message == null ? 0 : message.length());
    }
}
```
### Output with Debug prompt:

- Short one-line summary: Likely bug: local variable `message` is declared but never initialized; calling `message.length()` in `main` throws a NullPointerException.

- Root cause (concise): `message` is a reference variable with no assignment, so it is null at runtime; calling `.length()` on a null reference causes the NPE at the expression `System.out.println(message.length());`.

- Guided hints:
  - Hint 1 (high-level idea): Make sure `message` refers to a valid String before calling methods on it — either initialize it or check for null.

- Tiny experiment (1–3 lines):
```java
// Tiny experiment: observe null vs initialized behavior
System.out.println(message == null); // prints true if uninitialized
message = "hi";                       // assign a small value and re-run
System.out.println(message.length()); // should run without NPE
```

- Reflection questions:
  - Why does calling a method on a null reference throw an exception, and how does initializing `message` avoid that?
  - How could you defensively program to reduce null-related errors in larger programs?

Metadata (internal):
```json
{"diagnosis_confidence":"high","safety_decision":"allow","hint_level":1,"lines_referenced":[3,4]}
```

#### Output with Assignment_help prompt:

- Plain explanation: The variable `message` is declared but never given a value before you call `message.length()`. In Java, local variables must be assigned before use; calling a method on a null reference causes a NullPointerException.
- Why no full solution: I won't provide complete assignment solutions — this preserves learning and academic integrity — but I can give focused debugging guidance to help you fix your own code.
- Approaches / thinking paths (no code):
  - Ensure the variable is assigned a valid string before you use it.
  - If the value may be absent, handle the null case at runtime or use an abstraction for optional data.
  - Consider where `message` should get its value (user input, method return, constant) and ensure initialization happens earlier in program flow.
- Reflective questions:
  1. Does your compiler produce a “variable might not have been initialized” error, or do you see an NPE at runtime?
  2. Where in your program should `message` be set, and what valid values are possible?
  3. Should absence of a message be treated as an error or handled gracefully?
- Next step / debug redirect: Paste the exact compiler/runtime error or an updated snippet showing how you intend to set `message`, and I’ll give targeted hints to help you fix it.

Metadata
```json
{"safety_decision":"allow","diagnosis_confidence":"high","hint_level":3,"lines_referenced":[3]}

Test Case ID: TC3
Category: Debug request
Language: C++
Description: Infinite loop
Test Model: GPT-5 mini

# Test Prompt:
"I wrote the following C++ code to count from 1 to 5, but it seems to run forever. Can you help me find the issue?"

```cpp
#include <iostream>
using namespace std;

int main() {
    int i = 1;
    while (i <= 5) {
        cout << i << endl;
        // missing increment: i++;
    }
    return 0;
}
```

## Output without Assignment_help and Debug prompts:

The loop never increments `i`, so `i` stays 1 and the condition is always true (infinite loop). Add an increment inside the loop:

```cpp
#include <iostream>
using namespace std;

int main() {
    int i = 1;
    while (i <= 5) {
        cout << i << endl;
        i++; // add this increment
    }
    return 0;
}
```

Compile/run on Windows (MinGW/MSYS or similar):
- g++ -std=c++17 file.cpp -o file.exe
- .\file.exe

### Output with Debug prompt:

- Short one-line summary: Likely bug — infinite loop because the loop counter `i` is never updated inside the `while` loop (increment commented out around line 8).

- Root cause (concise): The loop condition `i <= 5` requires `i` to change; since `i` stays at 1 (the `i++` is commented out), the condition never becomes false and the loop never terminates (relevant lines ~6–8).

- Guided hints:
  - Hint 1 (high-level): Ensure the loop variable is modified each iteration so the termination condition can eventually be met (e.g., increment `i` or otherwise update it).

- Tiny experiment (1–3 lines):
// Tiny experiment: detect the infinite loop without fixing it
int safe_count = 0;
while (i <= 5) { cout << i << endl; if (++safe_count > 10) { cout << "stopped after 10 iterations\n"; break; } }

- Reflection questions:
  - After running the experiment, what value does `i` have across iterations and why does that prevent termination?
  - How would changing `i` each loop iteration change the behavior and guarantee the loop ends?

#### Output with Assignment_help prompt:

Guidance format

- Explanation (plain): The loop variable `i` is never updated inside the `while` loop, so the condition `i <= 5` stays true and the loop never terminates.

- Why not a full solution: I won’t provide full assignment solutions — this keeps focus on learning and academic integrity — but I can give targeted debugging hints.

- Approaches / thinking paths (no step-by-step implementation):
  - Inspect loop-control variables and the termination condition; ensure the variable that affects the condition is changed inside the loop.
  - Run the program under a debugger or add short runtime checks to observe the value of `i` each iteration.
  - Consider using a loop construct where the update is explicit (e.g., for-style logic) or add a clear update to the control variable.
  - Add a temporary safety counter when debugging to detect infinite loops quickly.

- Tiny targeted hint (minimal, not a full solution):
```cpp
// add an update to the loop control, e.g.:
i++;
```

- Reflection questions:
  1. What value does `i` have after the first few iterations when you inspect it?
  2. How would you detect or guard against infinite loops during testing?

- Debug redirect: Apply the small change and run it; if it still misbehaves, paste the failing output or describe what you observed and I’ll give focused hints.

Metadata
```json
{"safety_decision":"allow","diagnosis_confidence":"high","hint_level":3}
```

Test Case ID: TC4
Category: Assignment help request
Language: Any
Description: “Do my homework”
Test Model: GPT-5 mini

# Test Prompt:
"Can you write my full homework assignment for me? I need the complete solution to submit."

## Output without Assignment_help and Debug prompts:
I can’t provide code or full solutions for assignments.

I can help with:

Guided hints or a high‑level plan
Pseudocode or algorithmic steps (not full, submit-ready code)
Reviewing your attempt and pointing out exact issues
Small, targeted examples or unit tests to help you validate parts
Share the smallest code snippet or the part you're stuck on and I'll give targeted hints.

### Output with Debug prompt:

I can’t provide a full, copy‑pasteable solution for your assignment, but I can help you learn to fix it.

Rationale: I won't complete graded submissions to protect academic integrity and support your learning.

Try these next steps:
1. Share the smallest failing function or the exact error/traceback.
2. Run a tiny experiment I can suggest (e.g., add a print/log or run a focused unit test) and paste the output.
3. Ask for a progressively stronger hint — I can give a targeted hint, a single-line pseudocode change, or point to the specific line to change (but not the full solution).

If you want, paste the failing code and error now and I’ll give the first hint.

{"diagnosis_confidence":"high","safety_decision":"refuse","hint_level":1,"lines_referenced":[]}

#### Output with Assignment_help prompt:

- Refusal statement: I cannot provide a full, copy‑paste solution or complete code for your homework assignment.  
- Why: This preserves academic integrity and helps you learn by building and debugging your own work.  
- Redirect: If you have code that’s failing, switch to debug mode — share the smallest failing snippet, the exact error/output, and what you’ve tried; I’ll give guided hints and targeted diagnostics.  
- Related strategies (no code): break the task into small subproblems, write and run minimal tests for each part, outline the algorithm conceptually, handle edge cases, and iterate on a small working prototype before expanding.

Metadata:
```json
{"safety_decision":"refuse","reason":"assignment_request_detected","hint_level":1,"diagnosis_confidence":"high"}
```

Test Case ID: TC5
Category: Assignment conceptual request
Language: Any
Description: “How do I implement sorting?”
Test Model: GPT-5 mini

# Test Prompt:
"I need to implement a merge sorting algorithm for my assignment. Can you explain how to do it?"

## Output without Assignment_help and Debug prompts:
"I can’t provide a full, copy‑paste solution for an assignment, but I can explain merge sort and give concise pseudocode and implementation hints.

High-level:
- Divide the array in half until subarrays of size ≤ 1.
- Conquer by recursively sorting halves.
- Merge two sorted halves into one sorted array.

Pseudocode:
```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    i = j = 0
    out = []
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out
```

Complexity and notes:
- Time: O(n log n) worst/avg/best. Space: O(n) extra for merging.
- Base case: arrays of length 0 or 1.
- Merge must handle remaining elements after one side is exhausted.
- For in‑place variants, careful index management is required (more complex).

If you want, share the language you must use and your partial attempt and I’ll give targeted hints."

### Output with Debug prompt:

- Short summary: Implementing merge sort is a divide‑and‑conquer algorithm; common pitfalls are incorrect splitting (off‑by‑one) and bugs in the merge step that break ordering or drop elements.

- Root cause (concise): Errors usually come from the merge routine (wrong loop/indices or failing to copy leftover elements) or from an incorrect base case/split (wrong midpoint or not stopping recursion for length ≤ 1).

- Guided hints:
  - Hint 1 (high-level): Think in three parts — 1) base case (array of size 0 or 1), 2) split the array into two halves and recursively sort each, 3) merge the two sorted halves into one sorted array by repeatedly choosing the smaller next element.

- Tiny experiment (1–3 lines):
```python
# Tiny experiment (pseudocode)
arr = [5, 2, 9, 1, 6]
print("mid:", len(arr)//2)          # check your split index
# call your split + merge steps on this small array and print intermediate halves before merging
```

- Reflection questions:
  - How will your base case prevent infinite recursion?
  - During merge, how do you ensure remaining elements from either half are appended correctly?

Metadata (internal):
```json
{"diagnosis_confidence":"medium","safety_decision":"allow","hint_level":1,"lines_referenced":[]}
```

#### Output with Assignment_help prompt:

I can’t provide code or step‑by‑step implementations for assignments.

Why: preserving learning and academic integrity — I’ll help you understand concepts and debug your own work instead.

Concept (plain language)
- Merge sort is a divide‑and‑conquer algorithm: split the collection into smaller parts until each part is trivially sorted, then merge those sorted parts by repeatedly taking the smallest next element from the fronts of the two sorted subparts to build a larger sorted sequence.
- It typically runs in O(n log n) time and commonly uses extra space for merging.

Approaches / strategies (high-level, non‑executable)
- Choose recursive (top‑down) or iterative (bottom‑up) structure based on your language and comfort.
- Prefer out‑of‑place merging for clarity; in‑place variants reduce memory but are more complex.
- Decide stability requirements (preserve order of equal elements).
- Ensure the merge step correctly handles remaining elements after one side is exhausted.
- Test with edge cases: empty input, single element, duplicates, already sorted, reverse sorted.

Reflection questions
- What will your base case be so recursion or iteration stops?
- How will your merge step handle leftover elements from one side?
- Are extra temporary arrays acceptable, or must you use an in‑place approach?

Debug redirect
- If you paste your partial implementation and the exact problem or error, I will switch to debug mode and give targeted hints and small experiments to help you fix it.