import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserFilters {
  gender?: string[]
  topics?: string[]
  hobbies?: string[]
  interests?: string[]
  profession?: string[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { userId, filters, sessionId } = await req.json()

    console.log('Finding match for user:', userId, 'with filters:', filters)

    // First, update or insert user into anonymous_users
    const { error: userError } = await supabase
      .from('anonymous_users')
      .upsert({
        id: userId,
        session_id: sessionId,
        filters: filters,
        is_online: true,
        last_seen: new Date().toISOString()
      })

    if (userError) {
      console.error('Error updating anonymous user:', userError)
      throw userError
    }

    // Check if user is already in queue
    const { data: existingQueue } = await supabase
      .from('matching_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'waiting')
      .single()

    if (existingQueue) {
      console.log('User already in queue, checking for updates...')
      // Update filters if changed
      await supabase
        .from('matching_queue')
        .update({ filters, updated_at: new Date().toISOString() })
        .eq('id', existingQueue.id)
    } else {
      // Add user to matching queue
      const { error: queueError } = await supabase
        .from('matching_queue')
        .insert({
          user_id: userId,
          filters: filters,
          status: 'waiting'
        })

      if (queueError) {
        console.error('Error adding to queue:', queueError)
        throw queueError
      }
    }

    // Find potential matches - ONLY waiting users who aren't already in a session
    const { data: waitingUsers, error: fetchError } = await supabase
      .from('matching_queue')
      .select('*')
      .eq('status', 'waiting')
      .neq('user_id', userId)
      .is('matched_with', null)

    if (fetchError) {
      console.error('Error fetching waiting users:', fetchError)
      throw fetchError
    }

    console.log(`Found ${waitingUsers?.length || 0} potential matches`)

    // Calculate match scores
    const calculateMatchScore = (userFilters: UserFilters, otherFilters: UserFilters): number => {
      let score = 0
      let totalCategories = 0

      const categories: (keyof UserFilters)[] = ['gender', 'topics', 'hobbies', 'interests', 'profession']

      categories.forEach(category => {
        const userArray = userFilters[category] || []
        const otherArray = otherFilters[category] || []

        if (userArray.length === 0 && otherArray.length === 0) {
          return // Skip empty categories
        }

        totalCategories++
        
        if (userArray.length === 0 || otherArray.length === 0) {
          score += 0.5 // Partial match if one has no preference
          return
        }

        // Check for any overlap
        const overlap = userArray.filter(item => otherArray.includes(item))
        if (overlap.length > 0) {
          score += 1
        }
      })

      return totalCategories > 0 ? score / totalCategories : 0
    }

    // Find best match
    let bestMatch = null
    let bestScore = 0

    for (const candidate of waitingUsers || []) {
      const score = calculateMatchScore(filters, candidate.filters as UserFilters)
      console.log(`Match score with ${candidate.user_id}: ${score}`)
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = candidate
      }
    }

    // If we found a good match (score > 0.3), create a session
    if (bestMatch && bestScore > 0.3) {
      console.log(`Creating session with match: ${bestMatch.user_id}, score: ${bestScore}`)

      // Create chat session
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user1_id: userId,
          user2_id: bestMatch.user_id,
          status: 'active'
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating session:', sessionError)
        throw sessionError
      }

      // Update both users in matching queue to matched status
      await supabase
        .from('matching_queue')
        .update({ status: 'matched', matched_with: bestMatch.user_id })
        .eq('user_id', userId)

      await supabase
        .from('matching_queue')
        .update({ status: 'matched', matched_with: userId })
        .eq('user_id', bestMatch.user_id)

      console.log('Match created successfully:', session.id)

      return new Response(
        JSON.stringify({
          success: true,
          matched: true,
          session: session,
          matchScore: bestScore
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // No match found yet
    console.log('No suitable match found, user remains in queue')
    return new Response(
      JSON.stringify({
        success: true,
        matched: false,
        message: 'Searching for a match...',
        queuePosition: (waitingUsers?.length || 0) + 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in find-match function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
