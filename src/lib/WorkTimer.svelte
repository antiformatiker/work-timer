<script lang="ts">
  import { timeToDate, type BreakTime } from '$lib'

  const { time = '08:00', timeout = 300 } = $props()

  let progress = $state(0)
  let startTime = $state(time)
  let newBreakStart = $state(time)
  let newBreakEnd = $state(time)
  let startDate = $derived(timeToDate(startTime))
  let checkPause = $state(true)
  let duration = $state(7.8)
  let pause = $state(30)
  let checkBreak = $state(false)
  let error = $state('')
  let breaks: BreakTime[] = $state([])
  let endDate = $derived.by(() => {
    let breakDurationsInMs = 0
    let durationInSeconds = duration * 60 * 60

    if (checkPause) {
      durationInSeconds += pause * 60
    }

    if (checkBreak) {
      breakDurationsInMs = breaks
        .map((b) => {
          const startDate = timeToDate(b.start)
          const endDate = timeToDate(b.end)

          return endDate.getTime() - startDate.getTime()
        })
        .reduce((v, a) => v + a, 0)
    }

    return new Date(startDate.getTime() + durationInSeconds * 1000 + breakDurationsInMs)
  })

  function addBreak() {
    error = ''
    const breakStartDate = timeToDate(newBreakStart)
    const breakEndDate = timeToDate(newBreakEnd)

    if (breakEndDate.getTime() <= breakStartDate.getTime()) {
      error =
        'Das Ende der Unterbrechung muss nach dem Beginn der Unterbrechung stattgefunden haben.'
      return
    }

    if (breakStartDate.getTime() <= startDate.getTime()) {
      error = 'Die Unterbrechung muss nach dem Einstempeln passiert sein.'
      return
    }

    breaks.push({
      start: newBreakStart,
      end: newBreakEnd
    })

    newBreakStart = startTime
    newBreakEnd = startTime
  }

  $effect(() => {
    if (duration <= 6) {
      pause = 0
    } else if (duration > 6 && duration <= 9) {
      pause = 30
    } else if (duration > 9) {
      pause = 45
    }
  })

  $effect(() => {
    const interval = setInterval(() => {
      const total = endDate.getTime() - startDate.getTime()
      const done = new Date().getTime() - startDate.getTime()

      progress = (100 / total) * done
    }, timeout)

    return () => clearInterval(interval)
  })
</script>

<div>
  <div>
    <label for="startTime">Beginn</label>
    <input type="time" id="startTime" bind:value={startTime} />
  </div>
  <div>
    <label for="checkpause">Pause?</label>
    <input type="checkbox" id="checkpause" bind:checked={checkPause} />
  </div>
  {#if checkPause}
    <div>
      <label for="pause">Pause in Minuten</label>
      <input type="number" id="pause" bind:value={pause} />
    </div>
  {/if}
  <div>
    <label for="duration">Arbeitszeit (Dezimal)</label>
    <input type="number" id="duration" bind:value={duration} />
  </div>
  <div>
    <label for="checkbreak">Unterbrechungen?</label>
    <input type="checkbox" id="checkbreak" bind:checked={checkBreak} />
  </div>
  {#if checkBreak}
    {#each breaks as b, index}
      <div>
        <div>
          <label for={`break-start-${index}`}>Von</label>
          <input readonly type="time" id={`break-start-${index}`} bind:value={b.start} />
        </div>
        <div>
          <label for={`break-end-${index}`}>Bis</label>
          <input readonly type="time" id={`break-end-${index}`} bind:value={b.end} />
        </div>
        <div>
          <button
            onclick={() => {
              breaks = breaks.filter(
                (b) => b.start !== breaks[index].start && b.end !== breaks[index].end
              )
            }}>Entfernen</button
          >
        </div>
      </div>
    {/each}
    <div>
      <div>
        <label for="break-start">Von</label>
        <input type="time" id="break-start" bind:value={newBreakStart} />
      </div>
      <div>
        <label for="break-end">Bis</label>
        <input type="time" id="break-end" bind:value={newBreakEnd} />
      </div>
      <button onclick={addBreak}>Hinzufügen</button>
    </div>
  {/if}
  <div>
    Du musst um <strong>{endDate.toLocaleTimeString()}</strong> Feierabend machen um {duration} Stunden
    {#if checkPause}(Inkl. Pause){/if} zu erreichen.
  </div>
  {#if error}
    <div style="color: red;">
      {error}
    </div>
  {/if}
  <div>
    So viel hast du heute schon geschafft: <strong>{progress.toFixed(2)}%</strong>
  </div>
</div>
