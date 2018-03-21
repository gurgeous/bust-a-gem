# generate tags with ripper-tags -f TAGS -R --force --extra=q .
module Hello
  class World
    attr_reader :a, :b
    attr_writer :c, :d
    attr_accessor :e, :f

    def a_real_method
      p gub
      p Hello::World
    end

    def self.class_method
      p 'hi'
    end

    def gub
      p 'hi'
    end

    def question?
      p 'hi'
    end

    def exclamation!
      p 'hi'
    end

    def with_comment # comment
      p 'hi'
    end
  end
end
