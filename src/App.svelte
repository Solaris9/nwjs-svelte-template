<script lang="ts">
  import * as os from "node:os";
  const platform = os.platform();
</script>

<main>
  <h1>Hello {platform}!</h1>
</main>