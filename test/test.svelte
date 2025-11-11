<svelte:options runes={true} />

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type RatingProps = {
    rating: number;
    /** Color of filled stars (any valid CSS color or var()) */
    color?: string;
    /** Color of text and outlines */
    textColor?: string;
    class?: string;
    fit?: boolean;
  } & HTMLAttributes<HTMLDivElement>;

  const {
    rating,
    fit = false,
    color = "var(--color-rym-primary)",
    textColor = "#fff",
    class: className,
    style,
    ...rest
  }: RatingProps = $props();
</script>

{#snippet stars(n: number)}
  {#each Array(n)}
    <svg viewBox="0 0 24 24">
      <use xlink:href="#svg-star-symbol"></use>
    </svg>
  {/each}
{/snippet}

<div
  title={rating > 0 ? `${rating / 2} / 5` : ""}
  class="font-bold text-[0.8em] {className}"
  style={`
      --rating-color: ${color};
      --rating-text-color: ${textColor};
      --star-size: 24px;
      ${style || ""}
    `}
  {...rest}
>
  <div
    class="
      relative
      text-[var(--rating-text-color)]
    "
  >
    <div
      class="
        relative
        text-[var(--rating-text-color)]
      "
      style={rating > 0 ? `width: calc(var(--star-size) * ${rating / 2})` : ""}
    >
      y
      {@render stars(5)}
    </div>

    {#if !fit}
      <div
        class="
          relative
          text-[var(--rating-text-color)]
        "
      >
        {@render stars(5)}
      </div>

      {#if rating === 0}
        <span
          class="
            absolute flex items-center justify-center
            inset-0
            text-[12px] tracking-[0.25em]
            cursor-default
          "
        >
          NOT RATED
        </span>
      {/if}
    {/if}
  </div>
</div>
