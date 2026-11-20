# Riemann Hypothesis in Lean 4 (Levent Alpöge)

**Website:** <https://adamrsophie.github.io/RiemannHypothesis/> with sections on the [mathematical background](https://adamrsophie.github.io/RiemannHypothesis/background.html), [the statements](https://adamrsophie.github.io/RiemannHypothesis/statements.html), [proof structure](https://adamrsophie.github.io/RiemannHypothesis/proof.html), [project layout](https://adamrsophie.github.io/RiemannHypothesis/layout.html), [verification](https://adamrsophie.github.io/RiemannHypothesis/verify.html), [the announcement note](https://adamrsophie.github.io/RiemannHypothesis/note.html) and an [FAQ](https://adamrsophie.github.io/RiemannHypothesis/faq.html).

This repository is an unofficial mirror of the Lean 4 project that [Levent Alpöge](https://alpo.ge/) released on 20 November 2026 together with his four page note [`remark.pdf`](https://alpo.ge/remark.pdf). In that note Alpöge writes that he believes he has, working with Claude, found a proof of the Riemann Hypothesis that also gives the Generalized Riemann Hypothesis for Dirichlet L-functions, and that the argument has been formalized in Lean "without assumptions".

The proof and all of its code belong to Levent Alpöge. This mirror only adds documentation. Nothing here has been independently built or checked; see [Status](#status-what-has-and-has-not-been-checked).

## Contents

- [What is claimed](#what-is-claimed)
- [The final statements](#the-final-statements)
- [How the top of the proof fits together](#how-the-top-of-the-proof-fits-together)
- [Project layout](#project-layout)
- [Build configuration](#build-configuration)
- [How to verify it yourself](#how-to-verify-it-yourself)
- [Status: what has and has not been checked](#status-what-has-and-has-not-been-checked)
- [The mathematical idea, as described in the note](#the-mathematical-idea-as-described-in-the-note)
- [Provenance](#provenance)
- [Copyright](#copyright)

## What is claimed

The project proves, as closed Lean theorems with no hypotheses:

1. The **Riemann Hypothesis** as stated in Mathlib (`RiemannHypothesis`): every nontrivial zero of the Riemann zeta function has real part 1/2.
2. **Nonvanishing to the right of 1/2** for every Dirichlet L-function: `L(χ, s) ≠ 0` whenever `Re s > 1/2`, except the pole of zeta at `s = 1`.
3. The **Generalized Riemann Hypothesis for Dirichlet L-functions**: every zero of `L(χ, s)` in the critical strip `0 < Re s < 1` lies on `Re s = 1/2`, for every Dirichlet character (primitive or not).

The note also mentions an expected extension to the Extended Riemann Hypothesis (Dedekind zeta functions). That extension is **not** part of this code.

## The final statements

The statements are written using only Mathlib definitions, in [`lean/src/Statements.lean`](lean/src/Statements.lean):

```lean
import Mathlib

def RiemannZetaZerosOnLine : Prop :=
  ∀ s : ℂ, riemannZeta s = 0 → (¬∃ n : ℕ, s = -2 * ((n : ℂ) + 1)) → s ≠ 1 → s.re = 1 / 2

def DirichletLNonvanishingRightOfHalf : Prop :=
  ∀ (N : ℕ) [NeZero N] (χ : DirichletCharacter ℂ N) (s : ℂ),
    1 / 2 < s.re → (χ ≠ 1 ∨ s ≠ 1) → DirichletCharacter.LFunction χ s ≠ 0

def DirichletLZerosOnLine : Prop :=
  ∀ (N : ℕ) [NeZero N] (χ : DirichletCharacter ℂ N) (s : ℂ),
    0 < s.re → s.re < 1 → DirichletCharacter.LFunction χ s = 0 → s.re = 1 / 2

def PrimitiveDirichletLZerosOnLine : Prop :=
  ∀ (N : ℕ) [NeZero N] (χ : DirichletCharacter ℂ N), χ.IsPrimitive →
    ∀ s : ℂ, 0 < s.re → s.re < 1 → DirichletCharacter.LFunction χ s = 0 → s.re = 1 / 2
```

The theorems themselves are in [`lean/src/Main.lean`](lean/src/Main.lean):

```lean
import Statements
import Supplements.Kernels.MainTheoremsAll

theorem riemannHypothesis : RiemannHypothesis := rhOfAll

theorem riemannZeta_eq_zero_re : RiemannZetaZerosOnLine := rhOfAll

theorem LFunction_ne_zero_of_half_lt_re : DirichletLNonvanishingRightOfHalf := allChi

theorem LFunction_eq_zero_re : DirichletLZerosOnLine := claimAll.2.1

theorem LFunction_eq_zero_re_of_isPrimitive : PrimitiveDirichletLZerosOnLine := critAll
```

`RiemannHypothesis` is Mathlib's own definition. Anyone checking the result therefore needs to trust only Mathlib's definitions of `riemannZeta`, `DirichletCharacter.LFunction` and `RiemannHypothesis`, the five lines of `Statements.lean`, and the Lean kernel.

## How the top of the proof fits together

Everything reduces to one statement, `UpperTheory.EveryCharacter`, which is literally the same proposition as `DirichletLNonvanishingRightOfHalf`: no Dirichlet L-function vanishes in the half plane `Re s > 1/2`.

```
Main.riemannHypothesis
  └─ rhOfAll                         Supplements/Kernels/MainTheorems.lean
       └─ Formalism.VW.rh_of_every   Formalism/GammaFactorNonvanishing/CritLine.lean
            ├─ Formalism.VW.rh_of_right   (functional equation of ζ; RhOfRight.lean)
            └─ allChi = UpperTheory.FinalTheorems.everyCharacter
                 Development/AutomorphicArithmetic/CharacterBoxes/MainConclusion.lean
                   └─ everyCharacter_of_row
                        ├─ LiteratureTheorems.every_character_of_literature_of_vWin
                        ├─ Zero.LLC.recTExists          (local Langlands input)
                        ├─ One.vwin_of_row
                        └─ Gal.Int.galoisLocalGlobalStrong_recParameter
```

The short, readable steps at the top are:

- **`Formalism.VW.rh_of_right`** (about 60 lines, imports only Mathlib). If `ζ(s) ≠ 0` for `Re s > 1/2`, `s ≠ 1`, then RH holds. For a zero with `Re s < 1/2` it applies the functional equation `riemannZeta_one_sub` and checks that the factors `2(2π)^(s-1)`, `Γ(1-s)` and `cos(π(1-s)/2)` cannot vanish away from the trivial zeros.
- **`Formalism.VW.rh_of_every`**. Specializes `EveryCharacter` to the trivial character mod 1, whose L-function is `ζ` (`LFunction_modOne_eq`), and feeds it to `rh_of_right`.
- **`Formalism.VW.critLine`**. For primitive `χ`, a zero with `Re s < 1/2` gives a zero of the completed L-function, and the functional equation `completedLFunction_one_sub` moves it to a zero of `L(χ⁻¹, 1 - s)` with `Re(1 - s) > 1/2`, which `EveryCharacter` forbids. The archimedean gamma factor is shown nonzero for `Re s > 0`.
- **`Claim.strip`** (`CharacterBoxes/ClaimStrip.lean`). Extends the strip statement from primitive to arbitrary characters: the Euler factors `1 - ψ(p) p^(-s)` relating `χ` to its primitive character never vanish for `Re s > 0`.

All the depth sits inside `everyCharacter`, i.e. in the roughly 175,000 files below it. Those files have not been read for this mirror, and nothing here describes how they work beyond the names of the directories.

## Project layout

The archive is kept byte for byte under [`lean/`](lean/). Sources live in `lean/src`.

| Library (lake target) | Lean files | Directory topics |
|---|---:|---|
| `Development` | 141,928 | `AbelianVarietyTheory` (99,187), `AutomorphicArithmetic` (18,431), `AutomorphicSpectrum` (15,147), `WeilBound` (7,051), `EtaleCohomology` (1,398), `ResolutionOfSingularities` (499), `DiscreteGroups` (215) |
| `Formalism` | 18,254 | 116 topic folders, e.g. `GammaFactorNonvanishing`, `BehrendSets`, `ArtinHasse`, `FormalGroupWitt`, `GaloisCohomology` |
| `GroundTheory` + `GroundTheoryFields` | 8,507 | `HeightsAndTheta` (6,410), `AutomorphicForms`, `ProfiniteCohomology`, `GlobalFields`, `LocalFields`, `PAdicHodge`, `ArithmeticGeometry`, `TateCohomology`, `Brauer`, `FunctionField` |
| `ReciprocityTheory` | 3,845 | 24 folders: class field theory, Chebotarev, geometry of numbers, reductive groups, theta summability, semistable reduction |
| `CompanionTheory` | 2,027 | `SpectralGeometry`, `AutomorphicTheory`, `RealGroups`, `HarishChandraModules`, `ThickeningEstimates`, `EightfoldTheory` |
| `PositivityTheory` | 449 | `AutomorphicForms`, `Representations`, `PublishedTheorems` |
| `Lemmata` | 167 | small standalone lemmas |
| `BuildAid` | 5 | build helpers (for example, removing `CompanionTheory` from library suggestions) |
| `Supplements` | 3 | `Kernels/MainTheorems*.lean`, the top level assembly |
| `Main` | 2 | roots `Statements.lean` and `Main.lean` |
| **Total** | **175,187** | about 1.3 GB of source; about 813,000 `theorem`/`lemma` and 233,000 `def`/`structure`/`class`/`inductive` declarations (text count) |

Directory names such as `PublishedInputs` or `PublishedTheorems` suggest formalized versions of results from the literature, but that is a reading of the names only.

## Build configuration

From [`lean/lakefile.toml`](lean/lakefile.toml) and [`lean/lean-toolchain`](lean/lean-toolchain):

| Item | Value |
|---|---|
| Lean toolchain | `leanprover/lean4:v4.33.1` |
| Mathlib | commit `0df444a360eaa60ab8c11dca51a86af692955474` |
| Lean options | `autoImplicit = false`, `relaxedAutoImplicit = false`, `maxHeartbeats = 4000000`, `maxSynthPendingDepth = 3` |
| Extra args | `--tstack=400000` (large thread stack) |
| `GroundTheoryFields` | `synthInstance.maxHeartbeats = 400000` |

## How to verify it yourself

Building needs a lot of time, memory and disk. Install [elan](https://github.com/leanprover/elan), then:

```bash
git clone https://github.com/adamrsophie/RiemannHypothesis.git
cd RiemannHypothesis/lean
lake exe cache get        # prebuilt Mathlib for the pinned commit
lake build Main
```

Then check that no axioms beyond Lean's standard three are used. Create `lean/Check.lean`:

```lean
import Main

#print axioms riemannHypothesis
#print axioms LFunction_ne_zero_of_half_lt_re
#print axioms LFunction_eq_zero_re
#print axioms LFunction_eq_zero_re_of_isPrimitive
```

and run `lake env lean Check.lean`. A sound result lists only `propext`, `Classical.choice` and `Quot.sound`. Any `sorryAx`, any custom axiom, or `Lean.ofReduceBool` would mean the claim depends on something extra. For a stronger check, replay the exported environment through an independent kernel such as [lean4checker](https://github.com/leanprover/lean4checker) or [nanoda](https://github.com/ammkrn/nanoda_lib).

## Status: what has and has not been checked

**Not done here:** the project has not been built, and `#print axioms` has not been run. The claim is Alpöge's, and it is **claimed, not independently verified here.**

**Done here (text search only):** a search over all 175,187 `.lean` files found zero occurrences of `sorry`, `admit`, `axiom` declarations, `opaque` declarations, `native_decide`, `implemented_by`, `@[extern]`, `sorryAx`, `ofReduceBool`, `unsafe`, or `debug.skipKernelTC`. A text search is a useful smell test but not a proof of anything: only a kernel check settles it.

## The mathematical idea, as described in the note

The following paraphrases `remark.pdf`; it is not an explanation derived from the code. Read the note itself for Alpöge's own words.

- The argument is described as a descendant of **Stepanov's method**, which proves the Riemann Hypothesis for curves over finite fields using an auxiliary polynomial vanishing to high **multiplicity**. Multiplicity has no obvious analogue over the integers ("something like differentiating whole numbers").
- Simple Fourier analytic ideas in a toy setting led to **chaining theta lifts** so that each lift mimics one extra order of multiplicity, in a natively automorphic way. For a von Mangoldt sum of length `X`, the suggested chain length was `√X`.
- The note's timeline (6 October to 16 November 2026) lists, among other steps: a "Stepanov determinant"; positivity `W(1_S) ≥ 0` via a determinant; switching to a weighted von Mangoldt sum with the sign from **Guinand-Weil**; determinants for GGP periods; **iterated theta lifts** `U(X0) → U(X1) → ⋯ → U(Xm)` between totally definite unitary groups, winning multiplicity `m`; divisibility via **Chowla-Selberg**, Weyl and the Siegel mass formula; an **Iwasawa tower**; a **seesaw** identifying the period of the iterated lift with a Bessel period (Rallis); the **Bost slope inequality**; a relative trace formula; a weakened form of **Vandiver's conjecture** for classes that cannot be killed by twisting; and a choice of Iwasawa tower using **Behrend** sets. GRH is dated 16 November 2026.
- Alpöge expects the argument to be "massively simplified" and plans a proper written account. He chose to release only the Lean code rather than a machine generated text of more than 250,000 pages.

## Provenance

| File | Bytes | SHA-256 |
|---|---:|---|
| `remark.pdf` (not redistributed, see link) | 245,114 | `3fc97784b71ddd44ff8aa0a177e99622a1c61b13cfa843a0989ee4a7a0cfeb8d` |

The archive was distributed as `https://alpo.ge/lean.tar.gz.part01` through `part14`. The `lean/` directory here is the unmodified extracted archive. Another mirror of the same archive is [jsmorph/rh](https://github.com/jsmorph/rh); the git tree hash of `lean/` in this repository, `e517b335d21898fd2506ad538a1e1775c0aaa4e4`, is identical to the `lean/` tree of that copy, so the two are byte for byte the same.

## Copyright

All Lean code under `lean/` is the work of Levent Alpöge. The archive ships without a license, so no license is granted here and copyright stays with the author. This repository is an unofficial mirror for study and verification. The README and website are documentation only. If the author asks, the mirror will be taken down.
