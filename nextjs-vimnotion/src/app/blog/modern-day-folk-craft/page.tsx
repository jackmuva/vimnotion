"use server";

import Image from "next/image";
import Link from "next/link";

export default async function ArticlePage() {
	return (
		<div className="h-dvh w-dvw px-2 pt-20 flex flex-col items-center">
			<div id="md-editor-blog" className="flex flex-col w-full max-w-[1100px] gap-4 overflow-y-auto 
				pb-20 px-4">
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-4">
						<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog`}
							className="hover:text-foreground/30">
							{"< Back to blog"}
						</Link>
						<div className="text-base flex w-full justify-between items-center 
							border-b border-b-foreground/30
						pb-2">
							<div>
								Written by: Jack
							</div>
							<div>
								Published: November 9, 2025
							</div>
						</div>
						<div className="text-sm lineclamp-3">

						</div>
					</div>
				</div>
				<h1>
					Software and the Modern Day Folk Crafts
				</h1>
				<div>
					&quot;What is folkcraft?&quot; was an essay written by Soetsu Yanagi in 1933. &quot;Mingei&quot; (&quot;min&quot; meaning
					the masses and &quot;gei&quot; meaning craft) could be anything from wooden spoons to clothing, to furniture.
					What Yanagi deemed as folkcraft were crafts with the following characteristics:
				</div>
				<ol>
					<li>
						<strong>for utility</strong> - not decorative, but instead sturdy, reliable, durable
					</li>
					<li>
						<strong>common</strong> - these items shouldn&#39;t be expensive; they are made by the people, for the people
					</li>
					<li>
						<strong>created with pure intentions</strong> - mingei craftsmen create not for money or artistic beauty,
						but with quality and utility above all else
					</li>
				</ol>
				<div className="w-full flex justify-center">
					<Image src={"/folk-craft-museum.jpg"} alt="book cover" height={700} width={700}
						className="rounded-sm" />
				</div>
				<div>
					Because mingei is common-place, the beauty of these folkcrafts could be enjoyed by everyone, not just
					the select few. In Yanagi&#39;s words: <em>&quot;if only a few select fine-art objects are beautiful, this ideal
						world will never be realized. Similarly, if only a few priests are faithful to their religious beliefs,
						the world of religion can no longer be said to exist.&quot;</em>
				</div>
				<h2>
					Software as a Modern Day Crafts
				</h2>
				<div>
					While the crafts that Yanagi wrote about in 1933 are no less relevant today, there are modern crafts
					that can be treated with the same mingei ethos.
				</div>
				<div>
					Software is one of these modern crafts that carries the folkcraft values that Yanagi wrote about.
					Specifically, <strong>the common-place, the democratization</strong> characteristic.
				</div>
				<div>
					I&#39;m not dropping a groundbreaking statement when I say that the internet has made software products and
					content more accessible than it&#39;s ever been in history. With an internet connection, it&#39;s essentially
					free to use common software. Thus, for software to be considered mingei, it needs to be made for utility
					and with pure intention.
				</div>
				<h3>
					Software Utility
				</h3>
				<div>
					Yanagi describes crafts built for use as high-quality and durable items. I&#39;m not here to debate
					good software practices for an application to be secure, resilient, available, [insert more buzzwords here].
					What I can say definitively is that we can all strive for quality and excellence. And so, while there is a
					baseline for a usable website (for example, secure authentication and data authorization),
					the intention to build high-quality software matters more than meeting a certain criteria.
				</div>
				<div>
					What&#39;s high quality for a new, burdgeoning baker will be different than a seasoned one.
				</div>
				<div className="w-full flex justify-center">
					<Image src={"/carmy.jpeg"} alt="carmen from the bear" height={700} width={700}
						className="rounded-sm" />
				</div>
				<div>
					That&#39;s perfectly
					fine. Quality is subjective. Intentionality matters more, which brings us to &quot;pure intentions.&quot;
				</div>
				<h3>
					Software of Pure Intention - Not for Monetary Gain, Beauty, or Approval
				</h3>
				<div>
					This characteristic of mingei that Yanagi perscribed is the one I disagree with to some extent. I live in Los
					Angeles and hear many people talk about art, purity, and creativity - how money and approval only occlude your
					ability to create great art. On the surface I agree with this thought, but I do think this &#34;purity of intention&#34;
					is a bit overrated. Creativity and beauty and craft can come from anywhere. There&#39;s no straightforward formula.
				</div>
				<div>
					What I do agree with, and what I think Yanagi is referring to, is extrinsic motivation&#39;s role in craft.
					Extrinsic motivation like money and approval will run dry. But intrinsic motivation like the pursuit of excellence,
					of beauty, of personal-development, do not desecrate mingei in my opinion. Pursuing not just uiltiy, but beauty
					and improvement, this does not conflict Yanagi&#39;s dream of a &quot;Kingdom of Beauty,&quot; where beauty can be in the hands of
					the common folk. If anything, it brings that dream closer.
				</div>
				<h2>
					The Current State of Software as Mingei
				</h2>
				<div>
					I didn&#39;t write this post to complain about the current state of software, about how big software seems less usable or
					about how AI has creators valuing speed over quality (just a few slight jabs). I wrote this because I was floored how
					relevant I felt Yanagi&#39;s essay is still today, and how software creators really embody the mingei spirit.
				</div>
				<div>
					In every era, there are workers that need to make a living or wave-riders trying to surf the next swell to riches.
					But I don&#39;t think that in every era there was a large open source community passionate and active in making and&nbsp;
					<strong>sharing</strong> the fruits of their labor. I don&#39;t think that in every era, there were this many people -
					both hobbyists and big corporate employees alike - sharing best practices in forums and blogs about software quality
					and developer experience, pushing the boundaries of the utlity that all mingei speaks to.
				</div>
				<div>
					It&#39;s one of the reasons, I love programming and do it whenever I can.
					I get to create mingei, be a part of a mingei community, and keep the tradition alive.
				</div>
				<div className="w-full flex justify-center">
					<Image src={"/beauty-cover.jpg"} alt="carmen from the bear" height={700} width={700}
						className="rounded-sm" />
				</div>
			</div>
		</div>
	);
}
